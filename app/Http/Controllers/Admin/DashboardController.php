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
        // ==============================
        // 0️⃣ RANGE WAKTU
        // ==============================
        $range = request('range', '90d');
        $days  = $range === '7d' ? 7 : ($range === '30d' ? 30 : 90);

        $now       = Carbon::now();
        $start     = $now->copy()->subDays($days)->startOfDay();
        $prevStart = $start->copy()->subDays($days);
        $prevEnd   = $start->copy()->subSecond();

        // ==============================
        // 1️⃣ REVENUE (TOTAL PEMBAYARAN LUNAS)
        // ==============================
        $rev     = (float) Payment::where('status', 'paid')
            ->whereBetween('created_at', [$start, $now])
            ->sum('jumlah_bayar');

        $revPrev = (float) Payment::where('status', 'paid')
            ->whereBetween('created_at', [$prevStart, $prevEnd])
            ->sum('jumlah_bayar');

        $revDiff = $rev - $revPrev;
        $revDiffPct = $revPrev > 0 ? (($rev - $revPrev) / $revPrev) * 100 : log1p($rev) * 5;
        $revDiffPct = max(min($revDiffPct, 100), -100);
        $revTrend   = $revDiffPct >= 0 ? 'up' : 'down';

        // ==============================
        // 2️⃣A ANGGOTA NON INSTANSI (role = member)
        // ==============================
        $newMembers     = (int) User::where('role', 'member')->whereBetween('created_at', [$start, $now])->count();
        $newMembersPrev = (int) User::where('role', 'member')->whereBetween('created_at', [$prevStart, $prevEnd])->count();

        $newMembersDiff = $newMembers - $newMembersPrev;
        $newMembersDiffPct = $newMembersPrev > 0
            ? (($newMembers - $newMembersPrev) / $newMembersPrev) * 100
            : log1p($newMembers) * 20;
        $newMembersDiffPct = max(min($newMembersDiffPct, 100), -100);
        $newMembersTrend = $newMembersDiffPct >= 0 ? 'up' : 'down';

        // ==============================
        // 2️⃣B ANGGOTA INSTANSI (role = institution)
        // ==============================
        $newInstitutions     = (int) User::where('role', 'institution')->whereBetween('created_at', [$start, $now])->count();
        $newInstitutionsPrev = (int) User::where('role', 'institution')->whereBetween('created_at', [$prevStart, $prevEnd])->count();

        $newInstitutionsDiff = $newInstitutions - $newInstitutionsPrev;
        $newInstitutionsDiffPct = $newInstitutionsPrev > 0
            ? (($newInstitutions - $newInstitutionsPrev) / $newInstitutionsPrev) * 100
            : log1p($newInstitutions) * 20;
        $newInstitutionsDiffPct = max(min($newInstitutionsDiffPct, 100), -100);
        $newInstitutionsTrend = $newInstitutionsDiffPct >= 0 ? 'up' : 'down';

        // ===================================================
        // 3️⃣ ACTIVE ACCOUNTS (status = 'diterima' di tabel members)
        // ===================================================

        // Semua akun aktif (member & institution)
        $activeAll = (int) DB::table('members')
            ->join('users', 'members.user_id', '=', 'users.id')
            ->where('members.status', 'diterima')
            ->count();

        // Aktif berdasarkan role
        $activeMembers = (int) DB::table('members')
            ->join('users', 'members.user_id', '=', 'users.id')
            ->where('users.role', 'member')
            ->where('members.status', 'diterima')
            ->count();

        $activeInstitutions = (int) DB::table('members')
            ->join('users', 'members.user_id', '=', 'users.id')
            ->where('users.role', 'institution')
            ->where('members.status', 'diterima')
            ->count();

        // Bandingkan dengan periode sebelumnya (berdasarkan updated_at)
        $activeMembersPrev = (int) DB::table('members')
            ->join('users', 'members.user_id', '=', 'users.id')
            ->where('users.role', 'member')
            ->where('members.status', 'diterima')
            ->whereBetween('members.updated_at', [$prevStart, $prevEnd])
            ->count();

        $activeInstitutionsPrev = (int) DB::table('members')
            ->join('users', 'members.user_id', '=', 'users.id')
            ->where('users.role', 'institution')
            ->where('members.status', 'diterima')
            ->whereBetween('members.updated_at', [$prevStart, $prevEnd])
            ->count();

        // Hitung % perubahan
        $activeMembersDiffPct = $activeMembersPrev > 0
            ? (($activeMembers - $activeMembersPrev) / $activeMembersPrev) * 100
            : ($activeMembers > 0 ? 100 : 0);

        $activeInstitutionsDiffPct = $activeInstitutionsPrev > 0
            ? (($activeInstitutions - $activeInstitutionsPrev) / $activeInstitutionsPrev) * 100
            : ($activeInstitutions > 0 ? 100 : 0);

        // Trend naik/turun
        $activeMembersTrend = $activeMembersDiffPct >= 0 ? 'up' : 'down';
        $activeInstitutionsTrend = $activeInstitutionsDiffPct >= 0 ? 'up' : 'down';

        // ==============================
        // 4️⃣ GROWTH RATE (proxy dari revenue)
        // ==============================
        $growthRate = (
            ($revDiffPct * 0.6) +          // 60% bobot dari pendapatan
            ($newMembersDiffPct * 0.3) +   // 30% dari jumlah member baru
            ($activeMembersDiffPct * 0.1)  // 10% dari akun aktif
        );

        // Batasi biar realistis (-100% s/d 100%)
        $growthRate = max(min($growthRate, 100), -100);


        // ==============================
        // 5️⃣ DATA UNTUK CHART
        // ==============================
        $chartDays = range(0, $days);
        $chartData = [];

        foreach ($chartDays as $i) {
            $date = $start->copy()->addDays($i)->format('Y-m-d');

            $dailyRevenue = (float) Payment::where('status', 'paid')
                ->whereDate('created_at', $date)
                ->sum('jumlah_bayar');

            $dailyMembers = (int) User::where('role', 'member')
                ->whereDate('created_at', $date)
                ->count();

            $dailyInstitutions = (int) User::where('role', 'institution')
                ->whereDate('created_at', $date)
                ->count();

            $dailyActive = (int) DB::table('members')
                ->where('status', 'diterima')
                ->whereDate('updated_at', '<=', $date)
                ->count();

            $chartData[] = [
                'date'             => $date,
                'revenue'          => $dailyRevenue,
                'new_members'      => $dailyMembers,
                'new_institutions' => $dailyInstitutions,
                'active_accounts'  => $dailyActive,
            ];
        }

        // ==============================
        // 6️⃣ FORMAT UNTUK FRONTEND
        // ==============================
        $chart = [
            'labels' => collect($chartData)->pluck('date'),
            'series' => [
                'revenue'          => collect($chartData)->pluck('revenue'),
                'new_members'      => collect($chartData)->pluck('new_members'),
                'new_institutions' => collect($chartData)->pluck('new_institutions'),
                'active_accounts'  => collect($chartData)->pluck('active_accounts'),
            ],
        ];

        // ==============================
        // 7️⃣ METRICS UNTUK KARTU
        // ==============================
        $metrics = [
            'revenue' => [
                'total'   => $rev,
                'diff'    => $revDiff,
                'diffPct' => $revDiffPct,
                'trend'   => $revTrend,
            ],
            'newMembers' => [
                'count'   => $newMembers,
                'diff'    => $newMembersDiff,
                'diffPct' => $newMembersDiffPct,
                'trend'   => $newMembersTrend,
            ],
            'newInstitutions' => [
                'count'   => $newInstitutions,
                'diff'    => $newInstitutionsDiff,
                'diffPct' => $newInstitutionsDiffPct,
                'trend'   => $newInstitutionsTrend,
            ],
            'activeAccounts' => [
                'total'   => $activeAll,
                'members' => [
                    'count'   => $activeMembers,
                    'diffPct' => $activeMembersDiffPct,
                    'trend'   => $activeMembersTrend,
                ],
                'institutions' => [
                    'count'   => $activeInstitutions,
                    'diffPct' => $activeInstitutionsDiffPct,
                    'trend'   => $activeInstitutionsTrend,
                ],
            ],
            'growthRate' => $growthRate,
        ];

        // ==============================
        // 8️⃣ KIRIM KE FRONTEND
        // ==============================
        return Inertia::render('Dashboard', [
            'metrics' => $metrics,
            'chart'   => $chart,
            'range'   => $range,
        ]);
    }
}
