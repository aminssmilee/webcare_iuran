<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PaymentValidationController extends Controller
{
    public function index(Request $request)
    {
        $uiStatus   = $request->query('status', 'all');
        $q          = trim((string) $request->query('q', ''));
        $timeRange  = $request->query('timeRange', 'all');
        $page       = (int) $request->query('page', 1);
        $perPage    = (int) $request->query('per_page', 10);

        $mapStatus = [
            'Pending'   => 'pending',
            'Approved'  => 'paid',
            'Completed' => 'paid',
            'Rejected'  => 'rejected',
            'Failed'    => 'rejected',
        ];
        $dbStatus = $mapStatus[$uiStatus] ?? null;

        $days = [
            '90d' => 90,
            '30d' => 30,
            '7d'  => 7,
        ][$timeRange] ?? null;

        $fromDate = $days ? now()->subDays($days) : null;

        $query = Payment::query()
            ->with(['member.user'])
            ->when($dbStatus, fn($q) => $q->where('status', $dbStatus))
            ->when($timeRange !== 'all', fn($q) => $q->where('created_at', '>=', $fromDate)) // ✅ ini kunci
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($sq) use ($q) {
                    $sq->where('periode', 'like', "%{$q}%")
                        ->orWhereHas(
                            'member.user',
                            fn($u) =>
                            $u->where('name', 'like', "%{$q}%")
                                ->orWhere('email', 'like', "%{$q}%")
                        );
                });
            })
            ->latest();


        $total = $query->count();
        $payments = $query->skip(($page - 1) * $perPage)->take($perPage)->get();

        // ==========================================================
        // 🔧 FIX: Tambahkan formatter untuk periode gabungan (awal-akhir)
        // ==========================================================
        $items = $payments->map(function ($p) {
            $user = optional($p->member)->user;

            // 🔹 Format teks periode
            $periodeTeks = '-';
            if (!empty($p->periode_awal) && !empty($p->periode_akhir)) {
                $awal = Carbon::createFromFormat('Y-m', $p->periode_awal)->isoFormat('MMMM YYYY');
                $akhir = Carbon::createFromFormat('Y-m', $p->periode_akhir)->isoFormat('MMMM YYYY');
                $periodeTeks = $awal === $akhir ? $awal : "{$awal} – {$akhir}";
            } elseif (!empty($p->periode)) {
                $periodeTeks = Carbon::createFromFormat('Y-m', $p->periode)->isoFormat('MMMM YYYY');
            }

            return [
                'id'            => $p->id,
                'id_member'     => $p->member?->id ?? null,
                'name'          => $user?->name ?? '-',
                'email'         => $user?->email ?? '-',
                'periode'       => $periodeTeks, // ✅ hasil format gabungan
                'amount'        => 'Rp ' . number_format((int) $p->jumlah_bayar, 0, ',', '.'),
                'paidAt'        => optional($p->created_at)->format('Y-m-d H:i'),
                'paymentProof'  => $p->bukti ? asset('storage/' . $p->bukti) : null,
                'status'        => ucfirst($p->status),
            ];
        });

        // ==========================================================
        // AJAX vs Inertia response
        // ==========================================================
        if ($request->ajax()) {
            return response()->json([
                'data' => $items,
                'meta' => [
                    'total'         => $total,
                    'current_page'  => $page,
                    'last_page'     => ceil($total / $perPage),
                    'per_page'      => $perPage,
                ],
            ]);
        }

        return inertia('PaymentValidation', [
            'payments' => [
                'data' => $items,
                'meta' => [
                    'total'         => $total,
                    'current_page'  => $page,
                    'last_page'     => ceil($total / $perPage),
                    'per_page'      => $perPage,
                ],
            ],
            'filters' => [
                'status'    => $uiStatus,
                'q'         => $q,
                'timeRange' => $timeRange,
                'page'      => $page,
            ],
        ]);
    }

    // ✅ Aksi: Approve Payment
    public function approve($id)
    {
        $payment = Payment::findOrFail($id);
        if ($payment->status !== 'pending') {
            return back()->with('error', 'Pembayaran sudah divalidasi sebelumnya.');
        }
        $payment->status = 'paid';
        $payment->save();

        return back()->with('success', '✅ Pembayaran berhasil disetujui.');
    }

    // ✅ Aksi: Reject Payment
    public function reject($id)
    {
        $payment = Payment::findOrFail($id);
        if ($payment->status !== 'pending') {
            return back()->with('error', 'Pembayaran sudah divalidasi sebelumnya.');
        }
        $payment->status = 'rejected';
        $payment->save();

        return back()->with('success', '❌ Pembayaran berhasil ditolak.');
    }

    public function overpaid($id, Request $request)
    {
        $payment = Payment::findOrFail($id);
        $payment->status = 'overpaid';
        $payment->note = $request->note;
        $payment->save();

        return back()->with('success', '💰 Pembayaran ditandai sebagai overpaid.');
    }

    public function expired($id, Request $request)
    {
        $payment = Payment::findOrFail($id);
        $payment->status = 'expired';
        $payment->note = $request->note;
        $payment->save();

        return back()->with('success', '⏰ Pembayaran ditandai sebagai expired.');
    }
}
