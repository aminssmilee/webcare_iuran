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
    public function index()
    {
        $users = User::whereIn('role', ['member', 'institution'])->get();

        $registrations = $users->map(function ($user) {
            $dokumenUrl = $user->dokumen ? asset('storage/' . $user->dokumen) : null;

            return [
                'id'               => $user->id,
                'name'             => $user->name,
                'email'            => $user->email,
                'roles'            => ucfirst($user->role),
                'submittedAt'      => $user->created_at->format('Y-m-d H:i'),
                'validationStatus' => ucfirst($user->status),
                'dokumen'          => $dokumenUrl,
            ];
        });

        return Inertia::render('RegistValidation', [
            'registrations' => $registrations,
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
