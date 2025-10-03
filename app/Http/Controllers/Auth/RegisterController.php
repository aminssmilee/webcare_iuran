<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Member;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class RegisterController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nama_lengkap' => 'required|string|max:255',
                'email'        => 'required|email|unique:users,email',
                'password'     => 'required|string|min:6|confirmed',
                'dokumen'      => 'nullable|mimes:pdf|max:2048',
            ]);

            // Simpan file dokumen jika ada
            $path = null;
            if ($request->hasFile('dokumen')) {
                $path = $request->file('dokumen')->store('dokumen', 'public');
            }

            // Buat user → status default pending, dokumen disimpan di tabel users
            $user = User::create([
                'id'       => (string) Str::uuid(),
                'name'     => $validated['nama_lengkap'],
                'email'    => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role'     => 'member',
                'status'   => 'pending', // wajib pending dulu
                'dokumen'  => $path,     // simpan dokumen ke users
            ]);

            // Buat profil member (opsional, bisa dipakai untuk data tambahan)
            Member::create([
                'id'           => strtoupper(Str::random(6)),
                'user_id'      => $user->id,
                'nama_lengkap' => $validated['nama_lengkap'],
                // dokumen & status jangan disimpan di sini lagi
            ]);

            // Arahkan ke halaman waiting
            return redirect()->route('member.waiting')
                ->with('success', 'Registrasi berhasil. Menunggu persetujuan admin.');
        } catch (\Exception $e) {
            Log::error('Register Error: ' . $e->getMessage());
            return back()->withErrors([
                'error' => 'Terjadi kesalahan saat registrasi.',
            ]);
        }
    }
}
