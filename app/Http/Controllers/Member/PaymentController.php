<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Models\Payment;
use App\Models\Fee;
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
            'months' => ['required', 'array', 'min:1'],
            'proof'  => ['required', 'file', 'mimes:jpeg,jpg,png,pdf', 'max:500'],
            'note'   => ['nullable', 'string', 'max:500'],
        ]);

        $buktiPath = $request->file('proof')->store('payment_proofs', 'public');
        $currentYear = now()->year;

        // ✅ Mapping role user → tipe fee
        $memberType = match ($user->role) {
            'institution' => 'institusi',
            'member'      => 'perorangan',
            default       => 'perorangan',
        };

        // ✅ Ambil fee berdasarkan role user & tahun
        $fee = Fee::where('member_type', $memberType)
            ->where('tahun', $currentYear)
            ->first();

        if (!$fee) {
            return back()->withErrors(['fee' => 'Data iuran untuk tahun ini belum diatur oleh admin.']);
        }

        // 🧮 Hitung total pembayaran berdasarkan jumlah bulan yang dipilih
        $selectedMonths = array_map('intval', $request->months);
        sort($selectedMonths);
        $jumlahBulan = count($selectedMonths);
        $nominalPerBulan = $fee->nominal / 12;
        $jumlahBayar = $jumlahBulan * $nominalPerBulan;

        // 🕒 Tentukan periode awal–akhir
        $periodeAwal  = sprintf('%04d-%02d', $currentYear, $selectedMonths[0]);
        $periodeAkhir = sprintf('%04d-%02d', $currentYear, end($selectedMonths));

        // ============================================================
        // 🚫 Cegah duplikasi pembayaran bulan yang sama
        // ============================================================
        $paidMonths = Payment::where('member_id', $member->id)
            ->whereIn('status', ['paid', 'pending']) // jangan boleh bayar ulang meskipun pending
            ->get()
            ->flatMap(function ($p) {
                $start = (int) date('n', strtotime($p->periode_awal));
                $end   = (int) date('n', strtotime($p->periode_akhir));
                return range($start, $end);
            })
            ->unique()
            ->toArray();

        $duplikat = array_intersect($selectedMonths, $paidMonths);

        if (!empty($duplikat)) {
            $bulanTerdeteksi = collect($duplikat)->map(fn($m) => date('F', mktime(0, 0, 0, $m, 1)))->implode(', ');
            return back()->withErrors([
                'months' => "Beberapa bulan sudah dibayar atau masih menunggu validasi admin: {$bulanTerdeteksi}."
            ]);
        }

        // ============================================================
        // 🧾 Simpan pembayaran baru
        // ============================================================
        Payment::create([
            'id'             => strtoupper(Str::random(6)),
            'member_id'      => $member->id,
            'periode'        => null,
            'periode_awal'   => $periodeAwal,
            'periode_akhir'  => $periodeAkhir,
            'jumlah_bayar'   => $jumlahBayar,
            'metode'         => 'transfer',
            'bukti'          => $buktiPath,
            'status'         => 'pending',
            'payment_status' => 'Tepat Waktu',
            'note'           => $request->note,
        ]);

        return back()->with('success', 'Pembayaran berhasil disimpan dan menunggu validasi admin.');
    }

    // ============================================================
    // 📊 Halaman utama daftar pembayaran
    // ============================================================
    public function index(Request $request)
    {
        $user = Auth::user();
        $member = $user->member;
        $currentYear = now()->year;

        // Tentukan tipe member dari role
        $memberType = match ($user->role) {
            'institution' => 'institusi',
            'member'      => 'perorangan',
            default       => 'perorangan',
        };

        // Ambil data fee sesuai tipe dan tahun berjalan
        $fee = Fee::where('member_type', $memberType)
            ->where('tahun', $currentYear)
            ->first();

        // Ambil data pembayaran member (jika sudah ada)
        $payments = Payment::where('member_id', $member->id ?? null)
            ->orderByDesc('created_at')
            ->get();

        // Mapping data pembayaran ke bentuk lebih mudah dibaca frontend
        $mapped = $payments->map(function ($p) {
            return [
                'id' => $p->id,
                'month' => $p->periode_awal && $p->periode_akhir
                    ? date('F Y', strtotime($p->periode_awal)) . ' - ' . date('F Y', strtotime($p->periode_akhir))
                    : ($p->periode_awal
                        ? date('F Y', strtotime($p->periode_awal))
                        : '-'),
                'amount' => 'Rp ' . number_format($p->jumlah_bayar, 0, ',', '.'),
                'status' => ucfirst($p->status),
                'paymentProof' => $p->bukti ? asset('storage/' . $p->bukti) : null,
            ];
        });

        // ✅ Ambil semua bulan yang sudah dibayar (status = paid/pending)
        $paidMonths = Payment::where('member_id', $member->id ?? null)
            ->whereIn('status', ['paid', 'pending'])
            ->get()
            ->flatMap(function ($p) {
                $start = (int) date('n', strtotime($p->periode_awal));
                $end   = (int) date('n', strtotime($p->periode_akhir));
                return range($start, $end);
            })
            ->unique()
            ->values()
            ->toArray();

        // === ✅ Struktur fee yang dikirim ke frontend ===
        $formattedFee = $fee
            ? [
                'nominal_tahunan'   => (float) $fee->nominal,
                'nominal_per_bulan' => floor($fee->nominal / 12), // dibulatkan ke bawah agar angka utuh
                'tahun'             => $fee->tahun,
                'member_type'       => $fee->member_type,
            ]
            : null;

        // === Return ke halaman Inertia ===
        return Inertia::render('MemberPayment', [
            'user'       => $user,
            'member'     => $member,
            'payments'   => $mapped,
            'fee'        => $formattedFee,
            'paidMonths' => $paidMonths, // ✅ dikirim ke React
        ]);
    }
}
