<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Models\Payment;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function store(Request $request)
    {
        $user   = Auth::user();
        $member = $user->member;

        if (!$member) {
            return back()->withErrors(['member' => 'Profil member belum lengkap.'])->withInput();
        }

        $request->validate([
            'months'    => ['required', 'array', 'min:1'],
            'months.*'  => ['integer', 'between:1,12'],
            'amount'    => ['required', 'numeric', 'min:1000'],
            'note'      => ['nullable', 'string', 'max:500'],
            'proof'     => ['required', 'file', 'mimes:jpeg,jpg,png,pdf', 'max:500'],
        ], [
            'proof.max' => 'Ukuran file maksimal 500KB.',
        ]);

        // Simpan file bukti pembayaran
        $buktiPath = $request->file('proof')->store('payment_proofs', 'public');

        $currentMonth = now()->month;
        $currentYear  = now()->year;
        $jumlahBayar  = (float) $request->amount;
        $metode       = 'transfer';
        $status       = 'pending'; // status validasi admin default

        $alreadyPaidMonths = [];

        foreach ($request->months as $m) {
            $m = (int) $m;
            $selectedYear = $m < $currentMonth ? $currentYear + 1 : $currentYear;
            $periode = sprintf('%04d-%02d', $selectedYear, $m);

            // Cek jika bulan sudah dibayar dan disetujui (paid)
            $alreadyPaid = Payment::where('member_id', $member->id)
                ->where('periode', $periode)
                ->where('status', 'paid')
                ->exists();

            if ($alreadyPaid) {
                $alreadyPaidMonths[] = $periode;
                continue;
            }

            // 🔍 Tentukan status pembayaran otomatis (Tepat Waktu / Rapel / Terlambat)
            if ($m == $currentMonth) {
                $paymentStatus = "Tepat Waktu";
            } elseif ($m > $currentMonth) {
                $paymentStatus = "Pembayaran Rapel";
            } else {
                $paymentStatus = "Pembayaran Terlambat";
            }

            // Ambil atau buat data baru
            $payment = Payment::firstOrNew([
                'member_id' => $member->id,
                'periode'   => $periode,
            ]);

            if (!$payment->exists) {
                do {
                    $id = strtoupper(Str::random(6));
                } while (Payment::whereKey($id)->exists());
                $payment->id = $id;
            }

            // Simpan data
            $payment->jumlah_bayar   = $jumlahBayar;
            $payment->metode         = $metode;
            $payment->bukti          = $buktiPath;
            $payment->status         = $status;          // Validasi admin: Pending
            $payment->payment_status = $paymentStatus;   // Otomatis: Tepat Waktu / Rapel / Terlambat
            $payment->note           = $request->note;
            $payment->save();
        }

        if (!empty($alreadyPaidMonths)) {
            $monthsList = collect($alreadyPaidMonths)
                ->map(fn($p) => date('F Y', strtotime($p)))
                ->implode(', ');

            return back()->withErrors([
                'months' => "Bulan {$monthsList} sudah dibayar dan tidak dapat dibayar ulang.",
            ]);
        }

        return back()->with('success', 'Pembayaran berhasil disimpan dan menunggu validasi admin.');
    }

    public function index(Request $request)
    {
        $payments = Payment::where('member_id', Auth::user()->member->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'mount' => date('F Y', strtotime($p->periode)),
                    'amount' => 'Rp ' . number_format($p->jumlah_bayar, 0, ',', '.'),
                    'paidAt' => optional($p->created_at)->format('d M Y H:i'),
                    'dueDate' => date('t M Y', strtotime($p->periode)),
                    'paymentProof' => $p->bukti ? asset('storage/' . $p->bukti) : null,
                    'note' => $p->note ?? '-',

                    // 🟢 INI BAGIAN PENTING — pastikan diambil dari model
                    'payment_status' => $p->getAttribute('payment_status') ?? 'Pending',

                    'status' => ucfirst($p->status ?? 'Pending'),
                ];
            });

        // 🧩 Debug log di Laravel log file (storage/logs/laravel.log)
        Log::info('📦 PAYMENT DEBUG DATA:', $payments->take(3)->toArray());

        return Inertia::render('MemberPayment', [
            'user' => Auth::user(),
            'member' => Auth::user()->member,
            'payments' => $payments,
            'profileComplete' => Auth::user()->member?->isComplete(),
        ]);
    }
}
