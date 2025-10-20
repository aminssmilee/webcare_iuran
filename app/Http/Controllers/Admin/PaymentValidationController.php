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
        // ✅ Ambil filter dari query
        $uiStatus   = $request->query('status', 'Pending'); // Pending | Completed | Failed
        $q          = trim((string) $request->query('q', '')); // search by month label / periode
        $timeRange  = $request->query('timeRange', '90d');   // 90d|30d|7d|all
        $page       = (int) $request->query('page', 1);
        $perPage    = 10;

        // ✅ Map UI → DB status
        $mapStatus = [
            'Pending'   => 'pending',
            'Completed' => 'paid',
            'Failed'    => 'rejected',
        ];
        $dbStatus = $mapStatus[$uiStatus] ?? 'pending';

        // ✅ Rentang waktu (opsional)
        $days = [
            '90d' => 90,
            '30d' => 30,
            '7d'  => 7,
            'all' => 9999,
        ][$timeRange] ?? 90;

        $fromDate = Carbon::now()->subDays($days);

        // ✅ Query
        $query = Payment::query()
            ->with(['member.user'])
            ->where('status', $dbStatus)
            ->when($timeRange !== 'all', fn($q) => $q->where('created_at', '>=', $fromDate))
            ->when($q !== '', function ($query) use ($q) {
                $qLower = strtolower($q);
                $monthMap = [
                    'january' => '01',
                    'february' => '02',
                    'march' => '03',
                    'april' => '04',
                    'may' => '05',
                    'june' => '06',
                    'july' => '07',
                    'august' => '08',
                    'september' => '09',
                    'october' => '10',
                    'november' => '11',
                    'december' => '12',
                ];
                $monthNum = $monthMap[$qLower] ?? null;

                $query->where(function ($sq) use ($q, $monthNum) {
                    $sq->where('periode', 'like', "%{$q}%");
                    if ($monthNum) {
                        $sq->orWhere('periode', 'like', "%-{$monthNum}%");
                    }
                });
            })
            ->latest();

        // ✅ Pagination manual
        $total = $query->count();
        $payments = $query->skip(($page - 1) * $perPage)->take($perPage)->get();

        // ✅ Transform ke shape front-end
        $items = $payments->map(function ($p) {
            $user    = optional($p->member)->user;
            $periode = $p->periode;
            $paidAt  = $p->created_at ? Carbon::parse($p->created_at)->format('Y-m-d H:i') : null;

            try {
                $monthLabel = Carbon::parse($periode . '-01')->translatedFormat('F');
            } catch (\Throwable $th) {
                $monthLabel = $periode;
            }

            $statusUi = match ($p->status) {
                'pending'  => 'Pending',
                'paid'     => 'Completed',
                'rejected' => 'Failed',
                default    => ucfirst($p->status),
            };

            return [
                'id'            => $p->id,
                'name'          => $user?->name ?? '-',
                'email'         => $user?->email ?? '-',
                'id_member'     => $p->member?->id ?? null,
                'mount'         => $monthLabel,
                'amount'        => 'Rp ' . number_format((int) $p->jumlah_bayar, 0, ',', '.'),
                'dueDate'       => null,
                'paidAt'        => $paidAt,
                'paymentProof'  => $p->bukti ? Storage::url($p->bukti) : null,
                'note'          => $p->note ?? null,
                'status'        => $statusUi,
            ];
        })->values();

        // ✅ Kirim ke Inertia
        return Inertia::render('PaymentValidation', [
            'payments' => [
                'data' => $items,
                'meta' => [
                    'total' => $total,
                    'current_page' => $page,
                    'last_page' => ceil($total / $perPage),
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
