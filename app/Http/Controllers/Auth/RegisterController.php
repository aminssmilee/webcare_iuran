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
            ]);

            // ✅ Simpan dokumen
            $path = $request->file('dokumen')->store('dokumen', 'public');

            // ✅ Buat user baru (belum aktif & belum verifikasi)
            $user = User::create([
                'id'       => (string) Str::uuid(),
                'name'     => $validated['nama_lengkap'],
                'email'    => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role'     => $validated['role'],
                'status'   => 'pending',
                'dokumen'  => $path,
            ]);

            // ==============================
            // 🔐 OTP VERIFICATION SYSTEM
            // ==============================

            // 1️⃣ Hapus OTP lama yang belum kadaluarsa (hindari spam)
            EmailOtp::where('user_id', $user->id)
                ->where('is_used', false)
                ->delete();

            // 2️⃣ Cek cooldown (boleh kirim OTP lagi setelah 30 detik)
            $lastOtp = EmailOtp::where('user_id', $user->id)
                ->where('created_at', '>', now()->subSeconds(30))
                ->first();

            if ($lastOtp) {
                return back()->withErrors([
                    'otp' => 'Tunggu 30 detik sebelum meminta OTP baru.'
                ]);
            }

            // 3️⃣ Generate kode OTP 6 digit
            $otpCode = random_int(100000, 999999);

            // 4️⃣ Simpan ke database (hash, bukan plaintext)
            EmailOtp::create([
                'user_id'    => $user->id,
                'otp_hash'   => Hash::make($otpCode),
                'channel'    => 'email',
                'purpose'    => 'register',
                'expires_at' => now()->addMinutes(10),
                'is_used'    => false,
            ]);

            // 5️⃣ Kirim email OTP (kode asli dikirim via Mail)
            Mail::to($user->email)->send(new OtpMail($otpCode));

            // 6️⃣ Arahkan ke halaman verifikasi OTP
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
