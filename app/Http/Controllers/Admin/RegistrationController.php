<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\AccountApprovedMail;
use App\Mail\AccountRejectedMail; // ✅ Tambah mailable baru

class RegistrationController extends Controller
{
    // ======================
    // ✅ Halaman daftar pendaftaran
    // ======================
    public function index(Request $request)
    {
        $search    = $request->query('q', '');
        $status    = $request->query('status', 'all');
        $timeRange = $request->query('timeRange', '90d');
        $page      = (int) $request->query('page', 1);
        $perPage   = (int) $request->query('per_page', 10);

        $query = \App\Models\User::whereIn('role', ['member', 'institution']);

        // 🔍 Filter pencarian
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // ⚙️ Filter status
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        // 🕒 Filter rentang waktu (7d / 30d / 90d)
        if (in_array($timeRange, ['7d', '30d', '90d'])) {
            $days = (int) str_replace('d', '', $timeRange);
            $query->where('created_at', '>=', now()->subDays($days));
        }

        // 📄 Pagination (otomatis dengan meta)
        $users = $query
            ->orderByDesc('created_at')
            ->paginate($perPage, ['*'], 'page', $page)
            ->appends($request->only(['q', 'status', 'timeRange', 'per_page']));

        // 🔁 Map data hasil query
        $registrations = $users->through(function ($user) {
            return [
                'id'               => $user->id,
                'name'             => $user->name,
                'email'            => $user->email,
                'roles'            => ucfirst($user->role),
                'submittedAt'      => $user->created_at->format('Y-m-d H:i'),
                'validationStatus' => ucfirst($user->status ?? 'Pending'),
                'dokumen'          => $user->dokumen ? asset('storage/' . $user->dokumen) : null,
            ];
        });

        // ⚡ Mode AJAX → JSON (untuk React pagination)
        if ($request->ajax() && !$request->header('X-Inertia')) {
            return response()->json([
                'data' => $registrations->items(),
                'meta' => [
                    'current_page' => $registrations->currentPage(),
                    'last_page'    => $registrations->lastPage(),
                    'total'        => $registrations->total(),
                    'per_page'     => $registrations->perPage(),
                ],
            ]);
        }

        // 🧩 Render via Inertia (first load)
        return Inertia::render('RegistValidation', [
            'registrations' => $registrations,
            'filters' => [
                'q'          => $search,
                'status'     => $status,
                'timeRange'  => $timeRange,
            ],
        ]);
    }

    // ======================
    // ✅ Approve user
    // ======================
    public function approve($id)
    {
        $user = User::findOrFail($id);

        // ✅ Cek apakah user sudah verifikasi email
        if (is_null($user->email_verified_at)) {
            return back()->with('error', "User {$user->name} belum verifikasi email, tidak dapat di-approve.");
        }

        // ✅ Jika sudah verifikasi → ubah status jadi active
        $user->status = 'active';
        $user->save();

        // ✅ Kirim email notifikasi approval
        try {
            Mail::to($user->email)->send(new AccountApprovedMail($user));
        } catch (\Exception $e) {
            Log::error('Gagal kirim email ke ' . $user->email . ': ' . $e->getMessage());
            return back()->with('error', 'User disetujui, tapi email gagal dikirim.');
        }

        return back()->with('success', "Registrasi {$user->name} disetujui, user aktif, dan email notifikasi telah dikirim.");
    }

    // ======================
    // ❌ Reject user (baru, lebih lengkap)
    // ======================
    public function reject(Request $request, $id)
    {
        // ✅ Validasi alasan wajib diisi
        $request->validate([
            'reason' => 'required|string|max:255',
        ]);

        $user = User::findOrFail($id);

        // ✅ Ganti status jadi "rejected" agar sinkron dengan tabel React kamu
        $user->status = 'rejected';
        $user->save();

        // ✅ Coba kirim email notifikasi penolakan
        try {
            Mail::to($user->email)->send(new AccountRejectedMail($user, $request->reason));
        } catch (\Exception $e) {
            Log::error('Gagal kirim email penolakan ke ' . $user->email . ': ' . $e->getMessage());
            return back()->with('error', "User {$user->name} ditolak, tapi email gagal dikirim.");
        }

        return back()->with('success', "Registrasi {$user->name} ditolak dan email notifikasi telah dikirim.");
    }
}
