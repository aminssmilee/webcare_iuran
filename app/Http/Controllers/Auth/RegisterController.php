<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Member;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
// use Illuminate\Support\Facades\Storage;
// use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;

class RegisterController extends Controller
{
    public function store(Request $request)
    {
        // 🧩 Debug (optional): pastikan file sampai
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
                'role' => 'required|in:institution,member',
                'dokumen'  => 'required|file|mimes:pdf|max:2048',
            ], [
                'email.regex'      => 'Email harus minimal 8 karakter dan menggunakan domain @gmail.com.',
                'email.unique'     => 'Email ini sudah terdaftar.',
                'dokumen.required' => 'Dokumen wajib diupload.',
                'dokumen.mimes'    => 'Dokumen harus berformat PDF.',
                'dokumen.max'      => 'Ukuran dokumen maksimal 2MB.',
                'role.required'    => 'Silakan pilih jenis akun Anda.',
                'role.in'          => 'Role tidak valid.',
            ]);

            // ✅ Simpan file dokumen ke storage
            $path = $request->file('dokumen')->store('dokumen', 'public');

            // ✅ Tentukan role berdasarkan input
            // Institution akan otomatis jadi "admin" jika mau diatur begitu
            $userRole = $validated['role'];

            // ✅ Simpan user baru
            $user = User::create([
                'id'       => (string) Str::uuid(),
                'name'     => $validated['nama_lengkap'],
                'email'    => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role'     => $userRole,
                'status'   => 'pending',
                'dokumen'  => $path,
            ]);

            // ✅ Simpan ke tabel member (kalau role member)
            // if ($userRole === 'member') {
            //     Member::create([
            //         'id'           => strtoupper(Str::random(6)),
            //         'user_id'      => $user->id,
            //         'nama_lengkap' => $validated['nama_lengkap'],
            //     ]);
            // }

            // ✅ Kirim email verifikasi
            $verifyUrl = URL::temporarySignedRoute(
                'verification.verify',
                now()->addMinutes(60),
                ['id' => $user->id, 'hash' => sha1($user->email)]
            );

            Mail::to($user->email)->send(new \App\Mail\VerifyEmailCustom($user, $verifyUrl));


            // ✅ Redirect ke halaman notifikasi verifikasi
            return redirect()->route('verification.notice')
                ->with('success', 'Registrasi berhasil! Silakan cek email kamu untuk verifikasi.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            dd([
                '💥 Error message' => $e->getMessage(),
                '📂 File' => $e->getFile(),
                '📍 Line' => $e->getLine(),
            ]);
        }
            Log::error('Gagal registrasi user: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat registrasi. Silakan coba lagi.');
        }   
}
