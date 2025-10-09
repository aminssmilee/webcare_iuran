<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Member;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Auth\Events\Registered;

class RegisterController extends Controller
{
    public function store(Request $request)
    {
        // 🧩 Debug: cek file sampai ke backend
        if (!$request->hasFile('dokumen')) {
            dd('❌ File tidak terkirim ke server', $request->allFiles());
        }

        try {
            // ✅ Validasi input
            $validated = $request->validate([
                'nama_lengkap' => 'required|string|max:255',
                'email' => [
                    'required',
                    'email',
                    'regex:/^[A-Za-z0-9._%+-]{8,}@gmail\.com$/i',
                    'unique:users,email',
                ],
                'password' => 'required|string|min:6|confirmed',
                'dokumen'  => 'required|file|mimes:pdf|max:2048',
            ], [
                'email.regex'      => 'Email harus minimal 8 karakter dan menggunakan domain @gmail.com.',
                'email.unique'     => 'Email ini sudah terdaftar.',
                'dokumen.required' => 'Dokumen wajib diupload.',
                'dokumen.mimes'    => 'Dokumen harus berformat PDF.',
                'dokumen.max'      => 'Ukuran dokumen maksimal 2MB.',
            ]);

            // ✅ Simpan file
            $path = $request->file('dokumen')->store('dokumen', 'public');

            // ✅ Simpan user
            $user = User::create([
                'id'       => (string) Str::uuid(),
                'name'     => $validated['nama_lengkap'],
                'email'    => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role'     => 'member',
                'status'   => 'pending',
                'dokumen'  => $path,
            ]);

            // ✅ Simpan member
            Member::create([
                'id'           => strtoupper(Str::random(6)),
                'user_id'      => $user->id,
                'nama_lengkap' => $validated['nama_lengkap'],
            ]);

            // ✅ Kirim event verifikasi
            event(new Registered($user));

            return redirect()->route('verification.notice')
                ->with('success', 'Registrasi berhasil! Silakan cek email kamu untuk verifikasi.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Register Error: '.$e->getMessage().' | File: '.$e->getFile().' | Line: '.$e->getLine());
            return back()->withErrors(['error' => 'Terjadi kesalahan saat registrasi.'])->withInput();
        }
    }
}
