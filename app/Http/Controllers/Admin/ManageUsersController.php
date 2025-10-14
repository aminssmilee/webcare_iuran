<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ManageUsersController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        $status = trim((string) $request->query('status', ''));
        $timeRange = trim((string) $request->query('timeRange', '90d'));

        $query = User::query()
            ->with('member')
            ->where('role', 'member', 'institution')
            ->orderBy('created_at', 'desc');

        // 🔎 Filter pencarian nama/email/NIK
        if ($q !== '') {
            $query->where(function ($qq) use ($q) {
                $qq->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%")
                    ->orWhereHas('member', function ($mm) use ($q) {
                        $mm->where('nik', 'like', "%{$q}%")
                            ->orWhere('alamat', 'like', "%{$q}%")
                            ->orWhere('pekerjaan', 'like', "%{$q}%");
                    });
            });
        }

        // 📊 Filter status (pending, active, inactive)
        if ($status !== '' && $status !== 'all') {
            $query->where('status', $status);
        }

        // ⏰ Filter berdasarkan waktu (7d, 30d, 90d)
        if (in_array($timeRange, ['7d', '30d', '90d'])) {
            $days = (int) str_replace('d', '', $timeRange);
            $query->where('created_at', '>=', now()->subDays($days));
        }

        // ✅ Gunakan pagination agar tabel ringan
        $users = $query->paginate(10)->through(function (User $u) {
            $m = $u->member;
            return [
                'id'             => $u->id,
                'name'           => $u->name ?? '-',
                'email'          => $u->email ?? '-',
                'roles'          => ucfirst($u->role),
                'nik'       => $m?->nik ?? '-',
                'birthPlaceDate' => $m?->tgl_lahir
                    ? (is_string($m->tgl_lahir) ? $m->tgl_lahir : $m->tgl_lahir->format('Y-m-d'))
                    : '-',
                'gender'         => $m?->jenis_kelamin === 'L' ? 'Male' : ($m?->jenis_kelamin === 'P' ? 'Female' : '-'),
                'address'        => $m?->alamat ?? '-',
                'whatsapp'       => $m?->no_wa ?? '',
                'education'      => $m?->pendidikan ?? '-',
                'occupation'     => $m?->pekerjaan ?? '-',
                'status'         => ucfirst($u->status ?? 'Pending'),
                'created_at'     => $u->created_at?->format('Y-m-d H:i'),
            ];
        });

        // 🚀 Kirim data ke Inertia
        return Inertia::render('ManageUsers', [
            'users' => $users,
            'filters' => [
                'q'         => $q,
                'status'    => $status,
                'timeRange' => $timeRange,
            ],
        ]);
    }
}
