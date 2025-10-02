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

        // cek user berdasarkan email
        $user = \App\Models\User::where('email', $request->email)->first();

        if (!$user) {
            return back()->withErrors([
                'email' => 'Email tidak terdaftar.',
            ])->onlyInput('email');
        }

        // cek password manual
        if (!Hash::check($request->password, $user->password)) {
            return back()->withErrors([
                'password' => 'Password salah.',
            ])->onlyInput('email');
        }

        // kalau sudah cocok, pakai Auth::login
        Auth::login($user);
        $request->session()->regenerate();

        // cek akun nonaktif
        if ($user->status === 'inactive') {
            Auth::logout();
            return back()->withErrors([
                'auth' => 'Akun Anda non-aktif. Silakan hubungi admin.',
            ]);
        }

        // cek role
        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        if ($user->role === 'member') {
            if ($user->member && $user->member->status === 'pending') {
                return redirect()->route('member.waiting');
            }
            return redirect()->route('member.home');
        }

        // fallback
        return redirect()->route('member.login');
    }

    public function destroy(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('member.login');
    }
}
