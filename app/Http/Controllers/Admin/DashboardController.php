<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Member;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // Ambil range dari query (?range=7d|30d|90d)
        $range = request('range', '90d');
        $days  = $range === '7d' ? 7 : ($range === '30d' ? 30 : 90);

        $now       = Carbon::now();
        $start     = $now->copy()->subDays($days)->startOfDay();
        $prevStart = $start->copy()->subDays($days);
        $prevEnd   = $start->copy()->subSecond();

        // ===================================================
        // 1️⃣ Revenue Metrics (status = paid)
        // ===================================================
        $rev     = (float) Payment::where('status', 'paid')
                    ->whereBetween('created_at', [$start, $now])
                    ->sum('jumlah_bayar');

        $revPrev = (float) Payment::where('status', 'paid')
                    ->whereBetween('created_at', [$prevStart, $prevEnd])
                    ->sum('jumlah_bayar');

        $revDiffPct = $revPrev > 0 ? (($rev - $revPrev) / $revPrev) * 100 : 0.0;
        $revTrend   = $revDiffPct >= 0 ? 'up' : 'down';

        // ===================================================
        // 2️⃣ New Customers Metrics (role = member)
        // ===================================================
        $newCust     = (int) User::where('role', 'member')->whereBetween('created_at', [$start, $now])->count();
        $newCustPrev = (int) User::where('role', 'member')->whereBetween('created_at', [$prevStart, $prevEnd])->count();
        $newCustDiffPct = $newCustPrev > 0 ? (($newCust - $newCustPrev) / $newCustPrev) * 100 : 0.0;
        $newCustTrend   = $newCustDiffPct >= 0 ? 'up' : 'down';

        // ===================================================
        // 3️⃣ Active Accounts Metrics (status = diterima)
        // ===================================================
        $active       = (int) Member::where('status', 'diterima')->count();
        $activeTrend  = 'up';
        $activeDiffPct = 0.0;

        // ===================================================
        // 4️⃣ Growth Rate (pakai % revenue sebagai indikator)
        // ===================================================
        $growthRate = $revDiffPct;

        // ===================================================
        // 5️⃣ Chart Data (Revenue, New Customers, Active Accounts)
        // ===================================================
        $chartDays = range(0, $days - 1);
        $chartData = [];

        foreach ($chartDays as $i) {
            $date = $start->copy()->addDays($i)->format('Y-m-d');

            // Revenue per hari
            $dailyRevenue = (float) Payment::where('status', 'paid')
                ->whereDate('created_at', $date)
                ->sum('jumlah_bayar');

            // Member baru per hari
            $dailyNewCustomers = (int) User::where('role', 'member')
                ->whereDate('created_at', $date)
                ->count();

            // Akun aktif per hari (status diterima)
            $dailyActive = (int) Member::where('status', 'diterima')
                ->whereDate('updated_at', '<=', $date)
                ->count();

            $chartData[] = [
                'date'            => $date,
                'revenue'         => $dailyRevenue,
                'new_customers'   => $dailyNewCustomers,
                'active_accounts' => $dailyActive,
            ];
        }

        // Format untuk frontend (biar fleksibel)
        $chart = [
            'labels' => collect($chartData)->pluck('date'),
            'series' => [
                'revenue'         => collect($chartData)->pluck('revenue'),
                'new_customers'   => collect($chartData)->pluck('new_customers'),
                'active_accounts' => collect($chartData)->pluck('active_accounts'),
            ],
        ];

        // ===================================================
        // 6️⃣ Metrics untuk Kartu Statistik
        // ===================================================
        $metrics = [
            'revenue' => [
                'total'   => $rev,
                'diffPct' => $revDiffPct,
                'trend'   => $revTrend,
            ],
            'newCustomers' => [
                'count'   => $newCust,
                'diffPct' => $newCustDiffPct,
                'trend'   => $newCustTrend,
            ],
            'activeAccounts' => [
                'count'   => $active,
                'diffPct' => $activeDiffPct,
                'trend'   => $activeTrend,
            ],
            'growthRate' => $growthRate,
        ];

        // ===================================================
        // 7️⃣ Kirim ke Frontend
        // ===================================================
        return Inertia::render('Dashboard', [
            'metrics' => $metrics,
            'chart'   => $chart,
            'range'   => $range,
        ]);
    }
}
