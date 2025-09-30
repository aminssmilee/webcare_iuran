<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Member;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // Register user + member
    public function register(Request $request)
    {
        $data = $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'nik' => 'required|unique:members|digits:16',
            'tgl_lahir' => 'required|date|before:today',
            'jenis_kelamin' => 'required|in:L,P',
            'alamat' => 'required|string',
            'hp' => 'required|string|max:20',
            'email' => 'required|email|unique:users|unique:members',
            'pendidikan' => 'nullable|string',
            'pekerjaan' => 'nullable|string',
            'dokumen' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:2048',
            'password' => 'required|string|min:6|confirmed',
        ]);

        // upload dokumen
        if ($request->hasFile('dokumen')) {
            $data['dokumen'] = $request->file('dokumen')->store('dokumen','public');
        }

        // buat member
        $member = Member::create($data);

        // buat user login
        $user = User::create([
            'name' => $data['nama_lengkap'],
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
            'member_id' => $member->id,
        ]);

        // token untuk login
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil',
            'token' => $token,
            'user' => $user,
            'member' => $member
        ], 201);
    }

    // Login
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json(['error' => true, 'message' => 'Email atau password salah'], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'token' => $token,
            'user' => $user
        ]);
    }

    // Logout
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Logout berhasil']);
    }
}
