<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\EmailOtp;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class OtpVerificationController extends Controller
{
    public function show(Request $request)
    {
        $email = $request->query('email');
        return Inertia::render('Auth/OtpVerification', ['email' => $email]);
    }

    public function verify(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp_code' => 'required|digits:6',
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return back()->withErrors(['email' => 'Email tidak ditemukan.']);
        }

        $otp = EmailOtp::where('user_id', $user->id)
            ->where('purpose', 'register')
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (!$otp || !Hash::check($request->otp_code, $otp->otp_hash)) {
            return back()->withErrors(['otp_code' => 'Kode OTP salah atau sudah kedaluwarsa.']);
        }

        $otp->update(['is_used' => true]);
        $user->update([
            'email_verified_at' => now(),
            // 'status' => 'verified_email',
        ]);


        return redirect()->route('member.login')
            ->with('success', 'Verifikasi berhasil! Silakan login.');
    }
}


// End of file