<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;        // ✅ tambahkan
use App\Mail\AccountApprovedMail;           // ✅ tambahkan

class RegistrationController extends Controller
{
    public function index()
    {
        $users = User::where('role', 'member')->get();

        $registrations = $users->map(function ($user) {
            $dokumenUrl = $user->dokumen ? asset('storage/' . $user->dokumen) : null;

            return [
                'id'               => $user->id,
                'name'             => $user->name,
                'email'            => $user->email,
                'submittedAt'      => $user->created_at->format('Y-m-d H:i'),
                'validationStatus' => ucfirst($user->status),
                'dokumen'          => $dokumenUrl,
            ];
        });

        return Inertia::render('RegistValidation', [
            'registrations' => $registrations,
        ]);
    }

    public function approve($id)
    {
        $user = User::findOrFail($id);

        // ✅ ubah status jadi active (disetujui)
        $user->status = 'active';
        $user->save();

        // ✅ kirim email ke user
        try {
            Mail::to($user->email)->send(new AccountApprovedMail($user));
        } catch (\Exception $e) {
            Log::error('Gagal kirim email ke ' . $user->email . ': ' . $e->getMessage());
            return back()->with('error', 'User disetujui, tapi email gagal dikirim.');
        }

        return back()->with('success', 'Registrasi disetujui, user aktif, dan email notifikasi telah dikirim.');
    }

    public function reject($id)
    {
        $user = User::findOrFail($id);
        $user->status = 'inactive';
        $user->save();

        return back()->with('success', 'Registrasi ditolak dan user nonaktif.');
    }
}
