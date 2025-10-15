<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use App\Mail\PasswordChangedMail;
use App\Models\UserLog;
use Inertia\Inertia;

class NewPasswordController extends Controller
{
    public function create(Request $request, $token)
    {
        return Inertia::render('Auth/ResetPassword', [
            'token' => $token,
            'email' => $request->email,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use ($request) {
                // ✅ Update password
                $user->forceFill([
                    'password' => Hash::make($request->password),
                ])->save();

                // ✅ Logout semua sesi lama (jika login di tempat lain)
                Auth::logoutOtherDevices($request->password);

                // ✅ Hapus token lama (otomatis oleh Laravel)
                // Password broker sudah handle penghapusan token di background

                // ✅ Kirim email notifikasi
                Mail::to($user->email)->send(new PasswordChangedMail($user));

                // ✅ Simpan log aktivitas
                UserLog::create([
                    'user_id'    => $user->id,
                    'action'     => 'Password direset melalui link reset email',
                    'ip'         => request()->ip(),
                    'user_agent' => request()->header('User-Agent'),
                ]);
            }
        );

        return $status === Password::PASSWORD_RESET
            ? redirect()->route('member.login')->with('status', 'Password berhasil diubah. Silakan login kembali.')
            : back()->withErrors(['email' => [__($status)]]);
    }
}
