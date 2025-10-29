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
        // 0️⃣ RANGE WAKTU (support "all")
        // ==============================
        $range = request('range', 'all');

        // Jika "all" → tampilkan semua data (tanpa batas tanggal)
        if ($range === 'all') {
            $start = null;
            $now = Carbon::now();
            $days = null;
            $prevStart = null;
            $prevEnd = null;
        } else {
            $days = $range === '7d' ? 7 : ($range === '30d' ? 30 : 90);
            $now = Carbon::now();
            $start = $now->copy()->subDays($days)->startOfDay();
            $prevStart = $start->copy()->subDays($days);
            $prevEnd = $start->copy()->subSecond();
        }

        // ==============================
        // 1️⃣ REVENUE (TOTAL PEMBAYARAN LUNAS)
        // ==============================
        $rev = (float) Payment::where('status', 'paid')
            ->when($start, fn($q) => $q->whereBetween('created_at', [$start, $now]))
            ->sum('jumlah_bayar');

        $revPrev = $start
            ? (float) Payment::where('status', 'paid')
                ->whereBetween('created_at', [$prevStart, $prevEnd])
                ->sum('jumlah_bayar')
            : 0;

        $revDiff = $rev - $revPrev;
        $revDiffPct = $revPrev > 0 ? (($rev - $revPrev) / $revPrev) * 100 : log1p($rev) * 5;
        $revDiffPct = max(min($revDiffPct, 100), -100);
        $revTrend   = $revDiffPct >= 0 ? 'up' : 'down';

        // ==============================
        // 2️⃣A ANGGOTA NON INSTANSI (role = member)
        // ==============================
        $newMembers = (int) User::where('role', 'member')
            ->when($start, fn($q) => $q->whereBetween('created_at', [$start, $now]))
            ->count();

        $newMembersPrev = $start
            ? (int) User::where('role', 'member')
                ->whereBetween('created_at', [$prevStart, $prevEnd])
                ->count()
            : 0;

        $newMembersDiff = $newMembers - $newMembersPrev;
        $newMembersDiffPct = $newMembersPrev > 0
            ? (($newMembers - $newMembersPrev) / $newMembersPrev) * 100
            : log1p($newMembers) * 20;
        $newMembersDiffPct = max(min($newMembersDiffPct, 100), -100);
        $newMembersTrend = $newMembersDiffPct >= 0 ? 'up' : 'down';

        // ==============================
        // 2️⃣B ANGGOTA INSTANSI (role = institution)
        // ==============================
        $newInstitutions = (int) User::where('role', 'institution')
            ->when($start, fn($q) => $q->whereBetween('created_at', [$start, $now]))
            ->count();

        $newInstitutionsPrev = $start
            ? (int) User::where('role', 'institution')
                ->whereBetween('created_at', [$prevStart, $prevEnd])
                ->count()
            : 0;

        $newInstitutionsDiff = $newInstitutions - $newInstitutionsPrev;
        $newInstitutionsDiffPct = $newInstitutionsPrev > 0
            ? (($newInstitutions - $newInstitutionsPrev) / $newInstitutionsPrev) * 100
            : log1p($newInstitutions) * 20;
        $newInstitutionsDiffPct = max(min($newInstitutionsDiffPct, 100), -100);
        $newInstitutionsTrend = $newInstitutionsDiffPct >= 0 ? 'up' : 'down';

        // ==============================
        // 3️⃣ ACTIVE ACCOUNTS (status = 'diterima')
        // ==============================
        $activeAll = (int) DB::table('members')
            ->join('users', 'members.user_id', '=', 'users.id')
            ->where('members.status', 'diterima')
            ->count();

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

        $activeMembersPrev = $start
            ? (int) DB::table('members')
                ->join('users', 'members.user_id', '=', 'users.id')
                ->where('users.role', 'member')
                ->where('members.status', 'diterima')
                ->whereBetween('members.updated_at', [$prevStart, $prevEnd])
                ->count()
            : 0;

        $activeInstitutionsPrev = $start
            ? (int) DB::table('members')
                ->join('users', 'members.user_id', '=', 'users.id')
                ->where('users.role', 'institution')
                ->where('members.status', 'diterima')
                ->whereBetween('members.updated_at', [$prevStart, $prevEnd])
                ->count()
            : 0;

        $activeMembersDiffPct = $activeMembersPrev > 0
            ? (($activeMembers - $activeMembersPrev) / $activeMembersPrev) * 100
            : ($activeMembers > 0 ? 100 : 0);

        $activeInstitutionsDiffPct = $activeInstitutionsPrev > 0
            ? (($activeInstitutions - $activeInstitutionsPrev) / $activeInstitutionsPrev) * 100
            : ($activeInstitutions > 0 ? 100 : 0);

        $activeMembersTrend = $activeMembersDiffPct >= 0 ? 'up' : 'down';
        $activeInstitutionsTrend = $activeInstitutionsDiffPct >= 0 ? 'up' : 'down';

        // ==============================
        // 4️⃣ GROWTH RATE
        // ==============================
        $growthRate = (
            ($revDiffPct * 0.6) +
            ($newMembersDiffPct * 0.3) +
            ($activeMembersDiffPct * 0.1)
        );
        $growthRate = max(min($growthRate, 100), -100);

        // ==============================
        // 5️⃣ DATA UNTUK CHART
        // ==============================
        // ==============================
        // 5️⃣ DATA UNTUK CHART
        // ==============================
        $chartData = [];

        if ($range === 'all') {
            // 📊 Mode ALL → tampilkan semua data harian dari awal data ada
            $earliestPayment = Payment::min('created_at');
            $startAll = $earliestPayment ? Carbon::parse($earliestPayment)->startOfDay() : Carbon::now()->subDays(90);

            $period = Carbon::parse($startAll)->daysUntil(Carbon::now());

            foreach ($period as $date) {
                $chartData[] = [
                    'date'             => $date->format('Y-m-d'),
                    'revenue'          => (float) Payment::where('status', 'paid')
                        ->whereDate('created_at', $date)
                        ->sum('jumlah_bayar'),
                    'new_members'      => (int) User::where('role', 'member')
                        ->whereDate('created_at', $date)
                        ->count(),
                    'new_institutions' => (int) User::where('role', 'institution')
                        ->whereDate('created_at', $date)
                        ->count(),
                    'active_accounts'  => (int) DB::table('members')
                        ->where('status', 'diterima')
                        ->whereDate('updated_at', '<=', $date)
                        ->count(),
                ];
            }
        } else {
            // 📆 Mode selain ALL → tampilkan range tertentu (7d, 30d, 90d)
            $chartDays = range(0, $days);
            foreach ($chartDays as $i) {
                $date = $start->copy()->addDays($i)->format('Y-m-d');

                $chartData[] = [
                    'date'             => $date,
                    'revenue'          => (float) Payment::where('status', 'paid')
                        ->whereDate('created_at', $date)
                        ->sum('jumlah_bayar'),
                    'new_members'      => (int) User::where('role', 'member')
                        ->whereDate('created_at', $date)
                        ->count(),
                    'new_institutions' => (int) User::where('role', 'institution')
                        ->whereDate('created_at', $date)
                        ->count(),
                    'active_accounts'  => (int) DB::table('members')
                        ->where('status', 'diterima')
                        ->whereDate('updated_at', '<=', $date)
                        ->count(),
                ];
            }
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
