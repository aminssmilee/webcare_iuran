<?php

namespace App\Http\Controllers\Member;
// app/Http/Controllers/Member/MemberController.php
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Payment;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class MemberController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user()->loadMissing('member');
        $member = $user->member;

        if (!$member) {
            // kalau belum punya member entry
            return Inertia::render('WaitingApproval', [
                'user' => $user,
                'member' => null,
                'payments' => [],
                'profileComplete' => false,
            ]);
        }

        // ambil semua pembayaran user ini
        $rows = Payment::where('member_id', $member->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(function (Payment $p) {
                // periode: "YYYY-MM" -> label "Month Period"
                $periode = $p->periode; // contoh "2025-01"
                $labelBulan = null;
                $dueDate = null;

                if ($periode && preg_match('/^\d{4}-\d{2}$/', $periode)) {
                    $dt = Carbon::createFromFormat('Y-m', $periode)->startOfMonth();
                    // Label tabel kolom "Month Period" → accessor "mount"
                    $labelBulan = $dt->isoFormat('MMMM YYYY'); // "January 2025" (sesuai locale kamu)
                    $dueDate = $dt->endOfMonth()->format('d M Y'); // "31 Jan 2025"
                }

                // status mapping: DB (pending|paid|rejected) → UI (Pending|Completed|Failed)
                $statusMap = [
                    'pending'  => 'Pending',
                    'paid'     => 'Completed',
                    'rejected' => 'Failed',
                ];
                $status = $statusMap[$p->status] ?? ucfirst($p->status);

                // amount: rupiah tanpa desimal
                $amount = 'Rp ' . number_format((float)$p->jumlah_bayar, 0, ',', '.');

                // proof URL: support Storage path
                $proof = $p->bukti
                    ? (str_starts_with($p->bukti, 'http')
                        ? $p->bukti
                        : Storage::url($p->bukti))
                    : null;

                return [
                    'mount'        => $labelBulan ?? $periode,          // <— kolom "Month Period"
                    'amount'       => $amount,                           // Rp 50.000
                    'dueDate'      => $dueDate,                          // "31 Jan 2025"
                    'paidAt'       => optional($p->created_at)->format('d M Y H:i'),
                    'paymentProof' => $proof,                             // URL bukti
                    'note'         => null,                               // belum ada kolom di DB → tampil "-"
                    'status'       => $status,                            // Pending/Completed/Failed
                ];
            });

        return Inertia::render('MemberPayment', [   // <— sesuaikan nama komponen Inertia-mu
            'user'            => $user,
            'member'          => $member,
            'payments'        => $rows,
            // 'profileComplete' => $user->isProfileComplete(),
        ]);
    }
}
