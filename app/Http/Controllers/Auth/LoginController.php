<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class LoginController extends Controller
{
    public function store(Request $request)
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = \App\Models\User::where('email', $request->email)->first();

        if (!$user) {
            return back()->withErrors([
                'email' => 'Email tidak terdaftar.',
            ])->onlyInput('email');
        }

        if (!Hash::check($request->password, $user->password)) {
            return back()->withErrors([
                'password' => 'Password salah.',
            ])->onlyInput('email');
        }

        // ✅ Verifikasi email hanya untuk member & institution
        if (in_array($user->role, ['member', 'institution']) && !$user->hasVerifiedEmail()) {
            return back()->withErrors([
                'auth' => 'Silakan verifikasi email Anda terlebih dahulu. Cek inbox atau folder spam.',
            ]);
        }

        // ✅ Cek status (hanya berlaku untuk member & institution)
        if (in_array($user->role, ['member', 'institution'])) {
            if ($user->status === 'pending') {
                return back()->withErrors(['auth' => 'Akun Anda masih menunggu persetujuan admin.']);
            }
            if ($user->status === 'rejected') {
                return back()->withErrors(['auth' => 'Registrasi Anda ditolak. Silakan hubungi admin.']);
            }
            if ($user->status === 'inactive') {
                return back()->withErrors(['auth' => 'Akun Anda nonaktif. Silakan hubungi admin.']);
            }
        }

        // ✅ Login
        Auth::login($user);
        $request->session()->regenerate();

        // ✅ Arahkan sesuai role
        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        if (in_array($user->role, ['member', 'institution'])) {
            return redirect()->route('member.home'); // 🔥 arah sama
        }

        // fallback
        return redirect()->route('member.login');
    }

    public function destroy(Request $request)
    {
        if (Auth::check()) {
            $role = Auth::user()->role;

            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            if (in_array($role, ['admin', 'member', 'institution'])) {
                return redirect()->route('member.login');
            }
        }

        return redirect()->route('member.login');
    }
}
