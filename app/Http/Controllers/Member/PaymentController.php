<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Models\Payment;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function store(Request $request)
    {
        $user   = Auth::user();
        $member = $user->member;

        // ✅ Validasi profil
        if (!$member) {
            return back()->withErrors(['member' => 'Profil member belum lengkap.'])->withInput();
        }

        // ✅ Validasi input form
        $request->validate([
            'months'    => ['required', 'array', 'min:1'],
            'months.*'  => ['integer', 'between:1,12'],
            'amount'    => ['required', 'numeric', 'min:1000'],
            'note'      => ['nullable', 'string', 'max:500'],
            'proof'     => ['required', 'file', 'mimes:jpeg,jpg,png,pdf', 'max:500'], // KB
        ], [
            'proof.max' => 'Ukuran file maksimal 500KB.',
        ]);

        // ✅ Simpan bukti pembayaran ke storage/app/public/payment_proofs
        $buktiPath = $request->file('proof')->store('payment_proofs', 'public');

        // Variabel dasar
        $currentMonth = now()->month;
        $currentYear  = now()->year;
        $jumlahBayar  = (float) $request->amount;
        $metode       = 'transfer';
        $status       = 'pending';

        $alreadyPaidMonths = [];

        foreach ($request->months as $m) {
            $m = (int) $m;

            // 💡 Logika lintas tahun (jika bulan < sekarang → tahun depan)
            $selectedYear = $m < $currentMonth ? $currentYear + 1 : $currentYear;

            // Format periode: YYYY-MM
            $periode = sprintf('%04d-%02d', $selectedYear, $m);

            // 🚫 Cegah duplikasi jika status masih pending atau paid
            $alreadyPaid = Payment::where('member_id', $member->id)
                ->where('periode', $periode)
                ->whereIn('status', ['paid', 'pending']) // ❗ tambahan utama disini
                ->exists();

            if ($alreadyPaid) {
                $alreadyPaidMonths[] = $periode;
                continue;
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

            // Simpan data pembayaran
            $payment->jumlah_bayar = $jumlahBayar;
            $payment->status       = $status;    // pending
            $payment->metode       = $metode;
            $payment->bukti        = $buktiPath;
            $payment->save();
        }

        // ✅ Jika ada bulan yang sudah dibayar atau pending
        if (!empty($alreadyPaidMonths)) {
            $monthsList = collect($alreadyPaidMonths)
                ->map(fn($p) => date('F Y', strtotime($p)))
                ->implode(', ');

            return back()->withErrors([
                'months' => "Bulan {$monthsList} sudah dibayar atau sedang menunggu konfirmasi admin.",
            ]);
        }

        return back()->with('success', 'Pembayaran berhasil disimpan dan menunggu konfirmasi admin.');
    }

    public function index(Request $request)
    {
        $query = Payment::with('user')
            ->when(
                $request->q,
                fn($q) =>
                $q->whereHas(
                    'user',
                    fn($u) =>
                    $u->where('name', 'like', '%' . $request->q . '%')
                )->orWhere('month_name', 'like', '%' . $request->q . '%')
            )
            ->when($request->range, function ($q) use ($request) {
                $days = match ($request->range) {
                    '7d' => 7,
                    '30d' => 30,
                    '90d' => 90,
                    default => 90,
                };
                $q->where('created_at', '>=', now()->subDays($days));
            })
            ->latest()
            ->get();

        return Inertia::render('MemberPayment', [
            'user' => Auth::user(),
            'member' => Auth::user()->member,
            'payments' => $query,
            'profileComplete' => Auth::user()->member?->isComplete(),
        ]);
    }
}
