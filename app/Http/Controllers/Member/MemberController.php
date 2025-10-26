<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Payment;
use App\Models\Fee; // ✅ tambahkan model Fee
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class MemberController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user()->loadMissing('member');
        $member = $user->member;

        if (!$member) {
            return Inertia::render('MemberPayment', [
                'user' => $user,
                'member' => null,
                'payments' => [],
                'fee' => null, // biar tidak error di React
            ]);
        }

        // ✅ Ambil fee berdasarkan role & tahun sekarang
        $currentYear = now()->year;
        $memberType = match ($user->role) {
            'institution' => 'institusi',
            'member' => 'perorangan',
            default => 'perorangan',
        };

        $fee = Fee::where('member_type', $memberType)
            ->where('tahun', $currentYear)
            ->first();

        // ✅ Bentuk data fee agar konsisten untuk React
        $feeData = $fee ? [
            'tahun' => $fee->tahun,
            'member_type' => $fee->member_type,
            'nominal_tahunan' => (float) $fee->nominal,
            'nominal_per_bulan' => intval(round($fee->nominal / 12)),
        ] : [
            'tahun' => $currentYear,
            'member_type' => $memberType,
            'nominal_tahunan' => 0,
            'nominal_per_bulan' => 0,
        ];

        $paidMonths = Payment::where('member_id', $member->id ?? null)
            ->where('status', 'paid')
            ->get()
            ->flatMap(function ($p) {
                $start = (int) date('n', strtotime($p->periode_awal));
                $end   = (int) date('n', strtotime($p->periode_akhir));
                return range($start, $end);
            })
            ->unique()
            ->values()
            ->toArray();


        // ✅ Ambil daftar pembayaran
        $rows = Payment::where('member_id', $member->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(function (Payment $p) {
                $periodeTeks = $this->formatPeriodeGabungan($p);

                $statusMap = [
                    'pending'  => 'Pending',
                    'paid'     => 'Completed',
                    'rejected' => 'Failed',
                ];
                $status = $statusMap[$p->status] ?? ucfirst($p->status);

                $amount = 'Rp ' . number_format((float) $p->jumlah_bayar, 0, ',', '.');

                $dueDate = null;
                if (!empty($p->periode_akhir)) {
                    $dueDate = Carbon::createFromFormat('Y-m', $p->periode_akhir)
                        ->endOfMonth()->format('d M Y');
                } elseif (!empty($p->periode)) {
                    $dueDate = Carbon::createFromFormat('Y-m', $p->periode)
                        ->endOfMonth()->format('d M Y');
                }

                $proof = $p->bukti
                    ? (str_starts_with($p->bukti, 'http')
                        ? $p->bukti
                        : Storage::url($p->bukti))
                    : null;

                return [
                    'mount'           => $periodeTeks,
                    'amount'          => $amount,
                    'dueDate'         => $dueDate,
                    'paidAt'          => optional($p->created_at)->format('d M Y H:i'),
                    'paymentProof'    => $proof,
                    'note'            => $p->note ?? '-',
                    'status'          => $status,
                    'payment_status'  => $p->payment_status ?? '-',
                ];
            });

        return Inertia::render('MemberPayment', [
            'user'     => $user,
            'member'   => $member,
            'payments' => $rows,
            'fee'      => $feeData, // ✅ dikirim ke React
            'paidMonths' => $paidMonths,
        ]);
    }

    private function formatPeriodeGabungan(Payment $p): string
    {
        if (!empty($p->periode_awal) && !empty($p->periode_akhir)) {
            $awal = Carbon::createFromFormat('Y-m', $p->periode_awal)->isoFormat('MMMM YYYY');
            $akhir = Carbon::createFromFormat('Y-m', $p->periode_akhir)->isoFormat('MMMM YYYY');
            return $awal === $akhir ? $awal : "{$awal} – {$akhir}";
        }

        if (!empty($p->periode)) {
            return Carbon::createFromFormat('Y-m', $p->periode)->isoFormat('MMMM YYYY');
        }

        return '-';
    }
}
