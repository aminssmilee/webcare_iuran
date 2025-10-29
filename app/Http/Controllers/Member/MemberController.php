<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Payment;
use App\Models\Fee;
use App\Models\Announcement;
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
                'payments' => [
                    'data' => [],
                    'meta' => [
                        'current_page' => 1,
                        'last_page' => 1,
                        'per_page' => 10,
                        'total' => 0,
                    ],
                ],
                'fee' => null,
                'announcements' => [],
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

        // ✅ Ambil bulan yang sudah dibayar
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

        // ✅ Pagination Manual
        $page = max((int) $request->query('page', 1), 1);
        $perPage = max((int) $request->query('per_page', 10), 1);
        $skip = ($page - 1) * $perPage;

        $query = Payment::where('member_id', $member->id)->orderByDesc('created_at');
        $total = $query->count();

        $payments = $query->skip($skip)->take($perPage)->get();

        // ✅ Mapping data
        $rows = $payments->map(function (Payment $p) {
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

        // ✅ Ambil pengumuman terbaru (misal 5 terakhir)
        $announcements = Announcement::orderByDesc('publish_date')
            ->take(5)
            ->get(['id', 'title', 'content', 'publish_date']);

        // ✅ Kirim ke React — format sama tapi dengan meta pagination
        return Inertia::render('MemberPayment', [
            'user'          => $user,
            'member'        => $member,
            'payments'      => [
                'data' => $rows,
                'meta' => [
                    'current_page' => $page,
                    'last_page'    => ceil($total / $perPage),
                    'per_page'     => $perPage,
                    'total'        => $total,
                ],
            ],
            'fee'           => $feeData,
            'paidMonths'    => $paidMonths,
            'announcements' => $announcements,
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
