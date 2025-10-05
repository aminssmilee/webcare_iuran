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

        $query = User::query()
            ->with('member')
            ->where('role', 'member') // tampilkan hanya member
            ->orderBy('name');

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

        if ($status !== '') {
            $query->where('status', $status);
        }

        // ✅ ambil array langsung (tanpa paginator) supaya pasti “muncul”
        $rows = $query->get()->map(function (User $u) {
            $m = $u->member;
            return [
                'id'              => $u->id,
                'name'            => $u->name ?? '-',
                'email'           => $u->email ?? '-',
                'idNumber'        => $m?->nik ?? '-',
                'birthPlaceDate'  => $m?->tgl_lahir ? (is_string($m->tgl_lahir) ? $m->tgl_lahir : $m->tgl_lahir->format('Y-m-d')) : '-',
                'gender'          => $m?->jenis_kelamin === 'L' ? 'Male' : ($m?->jenis_kelamin === 'P' ? 'Female' : '-'),
                'address'         => $m?->alamat ?? '-',
                'whatsapp'        => $m?->no_wa ?? '-',
                'education'       => $m?->pendidikan ?? '-',
                'occupation'      => $m?->pekerjaan ?? '-',
                'status'          => ucfirst($u->status ?? 'pending'),
            ];
        })->values();

        return Inertia::render('ManageUsers', [
            'users'   => $rows, // <-- array siap dipakai DataTable
            'filters' => [
                'q'      => $q,
                'status' => $status,
            ],
        ]);
    }
}
