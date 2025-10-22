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

        if (!$member) {
            return back()->withErrors(['member' => 'Profil member belum lengkap.'])->withInput();
        }

        $request->validate([
            'months'    => ['required', 'array', 'min:1'],
            'months.*'  => ['integer', 'between:1,12'],
            'amount'    => ['required', 'numeric', 'min:1000'],
            'note'      => ['nullable', 'string', 'max:500'],
            'proof'     => ['required', 'file', 'mimes:jpeg,jpg,png,pdf', 'max:500'], // KB
        ], [
            'proof.max' => 'Ukuran file maksimal 500KB.',
        ]);

        // Simpan file bukti pembayaran ke storage/app/public/payment_proofs
        $buktiPath = $request->file('proof')->store('payment_proofs', 'public');

        // Variabel dasar
        $currentMonth = now()->month;  // bulan saat ini
        $currentYear  = now()->year;   // tahun saat ini
        $jumlahBayar  = (float) $request->amount;
        $metode       = 'transfer'; // default
        $status       = 'pending';  // default

        $alreadyPaidMonths = []; // untuk mencatat bulan yang sudah lunas agar bisa ditampilkan ke user

        foreach ($request->months as $m) {
            $m = (int) $m; // 1..12

            // 💡 Logika tambahan (fleksibel lintas tahun)
            // Jika bulan yang dipilih < bulan sekarang, maka dianggap tahun depan
            $selectedYear = $m < $currentMonth ? $currentYear + 1 : $currentYear;

            // Format periode jadi YYYY-MM (contoh: 2025-03 atau 2026-01)
            $periode = sprintf('%04d-%02d', $selectedYear, $m);

            // ✅ Cek apakah bulan ini sudah lunas (status = paid)
            $alreadyPaid = Payment::where('member_id', $member->id)
                ->where('periode', $periode)
                ->where('status', 'paid')
                ->exists();

            if ($alreadyPaid) {
                // Simpan ke array untuk pesan error nanti
                $alreadyPaidMonths[] = $periode;
                continue; // skip bulan yang sudah lunas
            }

            // Ambil jika sudah ada data sebelumnya, kalau belum buat baru
            $payment = Payment::firstOrNew([
                'member_id' => $member->id,
                'periode'   => $periode,
            ]);

            if (!$payment->exists) {
                // generate id string(6) unik
                do {
                    $id = strtoupper(Str::random(6));
                } while (Payment::whereKey($id)->exists());
                $payment->id = $id;
            }

            // Simpan data pembayaran
            $payment->jumlah_bayar = $jumlahBayar;
            $payment->status       = $status;    // pending
            $payment->metode       = $metode;    // transfer
            $payment->bukti        = $buktiPath; // path bukti file
            $payment->save();
        }

        // ✅ Jika ada bulan yang sudah lunas, tampilkan pesan error
        if (!empty($alreadyPaidMonths)) {
            $monthsList = collect($alreadyPaidMonths)
                ->map(fn($p) => date('F Y', strtotime($p))) // ubah ke nama bulan (ex: January 2025)
                ->implode(', ');

            return back()->withErrors([
                'months' => "Bulan {$monthsList} sudah dibayar dan tidak dapat dibayar ulang.",
            ]);
        }

        return back()->with('success', 'Pembayaran berhasil disimpan.');
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
