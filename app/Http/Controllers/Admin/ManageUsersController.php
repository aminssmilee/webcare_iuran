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
        $q         = trim((string) $request->query('q', ''));
        $status    = trim((string) $request->query('status', ''));
        $timeRange = trim((string) $request->query('timeRange', '90d'));
        $page      = (int) $request->query('page', 1);

        $query = User::query()
            ->with('member')
            ->where('role', '!=', 'admin')
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc');

        // 🔍 Filter pencarian
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

        // 📊 Filter status
        if ($status !== '' && $status !== 'all') {
            $query->where('status', $status);
        }

        // ⏰ Filter waktu
        if (in_array($timeRange, ['7d', '30d', '90d'])) {
            $days = (int) str_replace('d', '', $timeRange);
            $query->where('created_at', '>=', now()->subDays($days));
        }

        // 📄 Pagination dengan filter ikut dibawa
        $users = $query
            ->paginate(10, ['*'], 'page', $page)
            ->appends($request->only(['q', 'status', 'timeRange']))
            ->through(function (User $u) {
                $m = $u->member;
                return [
                    'id'             => $u->id,
                    'id_member'      => $u->member?->id ?? null,
                    'name'           => $u->name ?? '-',
                    'email'          => $u->email ?? '-',
                    'roles'          => ucfirst($u->role),
                    'nik'            => $m?->nik ?? '-',
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

        // ⚡️ Jika request AJAX (untuk fetchUsers)
        if ($request->ajax() && !$request->header('X-Inertia')) {
            return response()->json([
                'data' => $users->items(),
                'meta' => [
                    'current_page' => $users->currentPage(),
                    'last_page'    => $users->lastPage(),
                    'total'        => $users->total(),
                    'per_page'     => $users->perPage(),
                ],
                'filters' => [
                    'q'         => $q,
                    'status'    => $status,
                    'timeRange' => $timeRange,
                ],
            ]);
        }

        // 🚀 Render via Inertia (load pertama)
        return Inertia::render('ManageUsers', [
            'users' => $users,
            'filters' => [
                'q'         => $q,
                'status'    => $status,
                'timeRange' => $timeRange,
            ],
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'   => 'required|string|max:255',
            'email'  => 'required|email|max:255|unique:users,email,' . $user->id,
            'role'   => 'required|in:member,institution,admin',
        ]);

        $user->update($validated);

        if ($user->member) {
            $user->member->update([
                'alamat' => $request->alamat ?? $user->member->alamat,
                'no_wa'  => $request->no_wa ?? $user->member->no_wa,
            ]);
        }

        return redirect()->back()->with('success', 'User berhasil diperbarui!');
    }

    public function destroy(User $user)
    {
        if (auth()->id() === $user->id) {
            return back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        if ($user->role === 'admin') {
            return back()->with('error', 'Akun admin tidak dapat dihapus.');
        }

        if ($user->member) {
            $user->member->delete();
        }

        $user->delete();

        return back()->with('success', 'User berhasil dihapus.');
    }
}
