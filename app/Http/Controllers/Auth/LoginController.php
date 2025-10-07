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

        if (!\Illuminate\Support\Facades\Hash::check($request->password, $user->password)) {
            return back()->withErrors([
                'password' => 'Password salah.',
            ])->onlyInput('email');
        }

        // ✅ Hanya member yang harus verifikasi email
        if ($user->role === 'member' && !$user->hasVerifiedEmail()) {
            return back()->withErrors([
                'auth' => 'Silakan verifikasi email Anda terlebih dahulu. Cek inbox atau folder spam.',
            ]);
        }

        // ✅ Status pengecekan member
        if ($user->role === 'member') {
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

        // ✅ Lolos semua, lanjut login
        \Illuminate\Support\Facades\Auth::login($user);
        $request->session()->regenerate();

        // Arahkan sesuai role
        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        if ($user->role === 'member') {
            return redirect()->route('member.home');
        }

        return redirect()->route('member.login');
    }


    public function destroy(Request $request)
    {
        // ✅ Tambahan: cek apakah yang login member atau admin
        if (Auth::check()) {
            $role = Auth::user()->role;

            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            if ($role === 'admin') {
                return redirect()->route('member.login'); // arahkan ke login admin
            }

            if ($role === 'member') {
                return redirect()->route('member.login'); // arahkan ke login member
            }
        }

        // fallback kalau tidak ada user
        return redirect()->route('member.login');
    }
}
