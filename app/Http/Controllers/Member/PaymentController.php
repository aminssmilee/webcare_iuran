<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Models\Payment;
use App\Models\Fee;
use Inertia\Inertia;
use Carbon\Carbon;

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
            ->whereIn('status', ['paid', 'pending'])
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
            $bulanTerdeteksi = collect($duplikat)
                ->map(fn($m) => date('F', mktime(0, 0, 0, $m, 1)))
                ->implode(', ');
            return back()->withErrors([
                'months' => "Beberapa bulan sudah dibayar atau masih menunggu validasi admin: {$bulanTerdeteksi}."
            ]);
        }

        // ============================================================
        // 🧠 Tentukan status pembayaran (Rapel, Tepat Waktu, atau Terlambat)
        // ============================================================
        $tanggalBayar = now();
        $tenggatTerakhir = Carbon::createFromFormat('Y-m', $periodeAkhir)->endOfMonth();

        $isLate = $tanggalBayar->gt($tenggatTerakhir);

        if ($jumlahBulan > 1) {
            // Jika lebih dari 1 bulan
            if ($isLate) {
                $paymentStatus = "Rapel {$jumlahBulan} Bulan (Terlambat)";
                $keterangan = "Pembayaran rapel {$jumlahBulan} bulan namun terlambat dari tenggat terakhir.";
            } else {
                $paymentStatus = "Rapel {$jumlahBulan} Bulan";
                $keterangan = "Pembayaran rapel {$jumlahBulan} bulan secara tepat waktu.";
            }
        } else {
            // Satu bulan saja
            if ($isLate) {
                $paymentStatus = "Pembayaran Terlambat";
                $selisih = $tenggatTerakhir->diffInDays($tanggalBayar);
                $keterangan = "Pembayaran terlambat {$selisih} hari dari tenggat.";
            } else {
                $paymentStatus = "Tepat Waktu";
                $keterangan = "Pembayaran dilakukan sebelum tenggat bulan terkait.";
            }
        }

        // ============================================================
        // 💾 Simpan ke database
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
            'payment_status' => $paymentStatus,
            'keterangan'     => $keterangan,
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

        $memberType = match ($user->role) {
            'institution' => 'institusi',
            'member'      => 'perorangan',
            default       => 'perorangan',
        };

        $fee = Fee::where('member_type', $memberType)
            ->where('tahun', $currentYear)
            ->first();

        $payments = Payment::where('member_id', $member->id ?? null)
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($p) {
                return [
                    'id'             => $p->id,
                    'month'          => $p->periode_awal && $p->periode_akhir
                        ? date('F Y', strtotime($p->periode_awal)) . ' – ' . date('F Y', strtotime($p->periode_akhir))
                        : ($p->periode_awal
                            ? date('F Y', strtotime($p->periode_awal))
                            : '-'),
                    'amount'         => 'Rp ' . number_format($p->jumlah_bayar, 0, ',', '.'),
                    'status'         => ucfirst($p->status),
                    'payment_status' => $p->payment_status ?? '-',
                    'keterangan'     => $p->keterangan ?? '-',
                    'paymentProof'   => $p->bukti ? asset('storage/' . $p->bukti) : null,
                ];
            });

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

        $formattedFee = $fee
            ? [
                'nominal_tahunan'   => (float) $fee->nominal,
                'nominal_per_bulan' => floor($fee->nominal / 12),
                'tahun'             => $fee->tahun,
                'member_type'       => $fee->member_type,
            ]
            : null;

        return Inertia::render('MemberPayment', [
            'user'       => $user,
            'member'     => $member,
            'payments'   => $payments,
            'fee'        => $formattedFee,
            'paidMonths' => $paidMonths,
        ]);
    }
}
