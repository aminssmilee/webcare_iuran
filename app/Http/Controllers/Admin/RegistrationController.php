<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;   // penting
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class RegistrationController extends Controller
{
    public function index()
    {
        $users = User::where('role', 'member')->get();

        $registrations = $users->map(function ($user) {
            $dokumenUrl = $user->dokumen ? asset('storage/' . $user->dokumen) : null;

            // 🔹 Tambahkan log biar kelihatan dikirim apa
            Log::info('Dokumen user:', [
                'id' => $user->id,
                'nama' => $user->name,
                'path' => $user->dokumen,
                'url' => $dokumenUrl,
            ]);
            return [
                'id'               => $user->id,
                'name'             => $user->name,
                'email'            => $user->email,
                'submittedAt'      => $user->created_at->format('Y-m-d H:i'),
                'validationStatus' => ucfirst($user->status),
                'dokumen'          => $user->dokumen ? asset('storage/' . $user->dokumen) : null,
            ];
        });

        return Inertia::render('RegistValidation', [
            'registrations' => $registrations,
        ]);
    }

    public function approve($id)
    {
        $user = User::findOrFail($id);
        $user->status = 'active'; // disetujui = aktif
        $user->save();

        return back()->with('success', 'Registrasi disetujui dan user aktif.');
    }

    public function reject($id)
    {
        $user = User::findOrFail($id);
        $user->status = 'inactive'; // ditolak = nonaktif
        $user->save();

        return back()->with('success', 'Registrasi ditolak dan user nonaktif.');
    }
}
