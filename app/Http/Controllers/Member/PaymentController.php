<?php

namespace App\Http\Controllers\Member;
// namespace App\Http\Controllers\Member;


use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Models\Payment;

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
            'months'    => ['required','array','min:1'],
            'months.*'  => ['integer','between:1,12'],
            'amount'    => ['required','numeric','min:1000'],
            'note'      => ['nullable','string','max:500'], // (belum disimpan karena kolomnya tidak ada)
            'proof'     => ['required','file','mimes:jpeg,jpg,png,pdf','max:500'], // KB
        ], [
            'proof.max' => 'Ukuran file maksimal 500KB.',
        ]);

        // Simpan file bukti ke storage/app/public/payment_proofs
        $buktiPath = $request->file('proof')->store('payment_proofs', 'public');

        $currentYear  = now()->year;
        $jumlahBayar  = (float) $request->amount;
        $metode       = 'transfer'; // default (sesuai migration), bisa diubah dari request jika diperlukan
        $status       = 'pending';  // default (sesuai migration)

        foreach ($request->months as $m) {
            $m       = (int) $m; // 1..12
            $periode = sprintf('%04d-%02d', $currentYear, $m); // "YYYY-MM"

            // ambil jika sudah ada, kalau belum buat baru
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

            $payment->jumlah_bayar = $jumlahBayar;
            $payment->status       = $status;    // pending
            $payment->metode       = $metode;    // transfer
            $payment->bukti        = $buktiPath; // path file
            $payment->save();
        }

        return back()->with('success', 'Pembayaran berhasil disimpan.');
    }
}
