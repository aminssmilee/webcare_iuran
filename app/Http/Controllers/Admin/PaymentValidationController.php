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
        // Ambil filter dari query
        $uiStatus   = $request->query('status', 'Pending'); // Pending | Completed | Failed
        $q          = trim((string) $request->query('q', '')); // search by month label / periode
        $timeRange  = $request->query('timeRange', '90d');   // 90d|30d|7d

        // Map UI → DB status
        $mapStatus = [
            'Pending'   => 'pending',
            'Completed' => 'paid',
            'Failed'    => 'rejected',
        ];
        $dbStatus = $mapStatus[$uiStatus] ?? 'pending';

        // Rentang waktu (opsional)
        $days = [
            '90d' => 90,
            '30d' => 30,
            '7d'  => 7,
        ][$timeRange] ?? 90;

        $fromDate = Carbon::now()->subDays($days);

        // Query
        $payments = Payment::query()
            ->with(['member.user']) // pastikan relation ada di model Payment
            ->where('status', $dbStatus)
            ->where('created_at', '>=', $fromDate)
            // search sederhana: cocokkan q ke 'YYYY-MM' atau nama bulan
            ->when($q !== '', function ($query) use ($q) {
                $qLower = strtolower($q);

                // kalau user mengetik nama bulan, ubah ke angka bulan
                $monthMap = [
                    'january' => '01','february' => '02','march' => '03','april' => '04',
                    'may' => '05','june' => '06','july' => '07','august' => '08',
                    'september' => '09','october' => '10','november' => '11','december' => '12',
                ];

                $monthNum = $monthMap[$qLower] ?? null;

                $query->where(function ($sq) use ($q, $monthNum) {
                    // cocokkan langsung ke kolom periode
                    $sq->where('periode', 'like', "%{$q}%");

                    // atau cocokkan ke bulan saja (YYYY-<mm>)
                    if ($monthNum) {
                        $sq->orWhere('periode', 'like', "%-{$monthNum}%");
                    }
                });
            })
            ->latest()
            ->get();

        // Transform ke shape yang dipakai DataTable front-end (getPaymentValidationColumns)
        $items = $payments->map(function ($p) {
            $user    = optional($p->member)->user;
            $periode = $p->periode; // 'YYYY-MM'
            $paidAt  = $p->created_at ? Carbon::parse($p->created_at)->format('Y-m-d H:i') : null;

            // Label bulan dari periode
            $mountLabel = null;
            try {
                $mountLabel = Carbon::parse($periode . '-01')->translatedFormat('F'); // contoh: "October"
            } catch (\Throwable $th) {
                $mountLabel = $periode;
            }

            // Map DB status → UI
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
                'idNumber'      => optional($p->member)->nik ?? '-',
                'mount'         => $mountLabel,
                'amount'        => 'Rp ' . number_format((int) $p->jumlah_bayar, 0, ',', '.'),
                'dueDate'       => null, // tidak ada di DB; biarkan kosong
                'paidAt'        => $paidAt,
                'paymentProof'  => $p->bukti ? Storage::url($p->bukti) : null,
                'note'          => $p->note ?? null, // jika belum ada kolom note di DB, akan null
                'status'        => $statusUi,
            ];
        })->values();

        return Inertia::render('PaymentValidation', [
            'payments'   => $items,
            'filters'    => [
                'status'    => $uiStatus,
                'q'         => $q,
                'timeRange' => $timeRange,
            ],
        ]);
    }
}
