<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\EmailOtp;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpMail;

class RegisterController extends Controller
{
    public function store(Request $request)
    {
        if (!$request->hasFile('dokumen')) {
            return back()->withErrors(['dokumen' => 'File dokumen wajib diupload.']);
        }

        try {
            // ✅ Validasi input dinamis sesuai role
            $validated = $request->validate([
                'nama_lengkap'  => $request->role === 'member' ? 'required|string|max:255' : 'nullable',
                'nama_instansi' => $request->role === 'institution' ? 'required|string|max:255' : 'nullable',
                'email' => [
                    'required',
                    'email',
                    'regex:/^[A-Za-z0-9._%+-]{8,}@gmail\.com$/i',
                    'unique:users,email',
                ],
                'password' => 'required|string|min:6|confirmed',
                'role'     => 'required|in:institution,member',
                'dokumen'  => 'required|file|mimes:pdf|max:2048',
            ]);

            // ✅ Simpan dokumen ke storage publik
            $path = $request->file('dokumen')->store('dokumen', 'public');

            // ✅ Tentukan nama sesuai role
            $namaUser = $request->role === 'institution'
                ? $validated['nama_instansi']
                : $validated['nama_lengkap'];

            // ✅ Buat user baru
            $user = User::create([
                'id'       => (string) Str::uuid(),
                'name'     => $namaUser,
                'email'    => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role'     => $validated['role'],
                'status'   => 'pending',
                'dokumen'  => $path,
            ]);

            // ==============================
            // 🔐 SISTEM OTP VERIFIKASI EMAIL
            // ==============================

            // Hapus OTP lama (jika ada)
            EmailOtp::where('user_id', $user->id)
                ->where('is_used', false)
                ->delete();

            // Cegah spam OTP (cooldown 30 detik)
            $lastOtp = EmailOtp::where('user_id', $user->id)
                ->where('created_at', '>', now()->subSeconds(30))
                ->first();

            if ($lastOtp) {
                return back()->withErrors([
                    'otp' => 'Tunggu 30 detik sebelum meminta OTP baru.'
                ]);
            }

            // Generate OTP baru
            $otpCode = random_int(100000, 999999);

            // Simpan OTP (hash)
            EmailOtp::create([
                'user_id'    => $user->id,
                'otp_hash'   => Hash::make($otpCode),
                'channel'    => 'email',
                'purpose'    => 'register',
                'expires_at' => now()->addMinutes(10),
                'is_used'    => false,
            ]);

            // Kirim email OTP
            Mail::to($user->email)->send(new OtpMail($otpCode));

            // Redirect ke halaman verifikasi
            return redirect()
                ->route('otp.verify.page', ['email' => $user->email])
                ->with('success', 'Registrasi berhasil! Silakan cek email kamu untuk kode OTP verifikasi.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();

        } catch (\Exception $e) {
            Log::error('💥 Gagal registrasi user: ' . $e->getMessage());

            return back()->with('error', 'Terjadi kesalahan pada sistem. Silakan coba lagi.');
        }
    }
}
