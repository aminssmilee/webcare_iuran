<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Member;
use App\Models\Payment;

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

        // Revenue (status paid saja)
        $rev     = (float) Payment::where('status','paid')
                    ->whereBetween('created_at', [$start, $now])
                    ->sum('jumlah_bayar');
        $revPrev = (float) Payment::where('status','paid')
                    ->whereBetween('created_at', [$prevStart, $prevEnd])
                    ->sum('jumlah_bayar');
        $revDiffPct = $revPrev > 0 ? (($rev - $revPrev) / $revPrev) * 100 : 0.0;
        $revTrend   = $revDiffPct >= 0 ? 'up' : 'down';

        // New customers (user role member baru dibuat)
        $newCust     = (int) User::where('role','member')->whereBetween('created_at', [$start, $now])->count();
        $newCustPrev = (int) User::where('role','member')->whereBetween('created_at', [$prevStart, $prevEnd])->count();
        $newCustDiffPct = $newCustPrev > 0 ? (($newCust - $newCustPrev) / $newCustPrev) * 100 : 0.0;
        $newCustTrend   = $newCustDiffPct >= 0 ? 'up' : 'down';

        // Active accounts (member dengan status diterima)
        $active       = (int) Member::where('status','diterima')->count();
        $activeTrend  = 'up';
        $activeDiffPct = 0.0;

        // Growth rate (pakai % revenue sbg indikator)
        $growthRate = $revDiffPct;

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

        // Chart dummy (opsional, aman kalau kosong di front-end)
        $chart = [
            'labels' => [],
            'series' => [],
        ];

        return Inertia::render('Dashboard', [
            'metrics' => $metrics,
            'chart'   => $chart,
            'range'   => $range,
        ]);
    }
}
