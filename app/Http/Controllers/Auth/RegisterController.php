<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Member;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class RegisterController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nama_lengkap' => 'required|string|max:255',
                'email' => [
                    'required',
                    'email',
                    'regex:/^[A-Za-z0-9._%+-]+@gmail\.com$/',
                    'unique:users,email',
                ],
                'password' => 'required|string|min:6|confirmed',
                'dokumen'  => 'required|mimes:pdf|max:2048',
            ], [
                'email.regex'      => 'Email harus menggunakan domain @gmail.com.',
                'email.unique'     => 'Email ini sudah terdaftar.',
                'dokumen.required' => 'Dokumen wajib diupload.',
                'dokumen.mimes'    => 'Dokumen harus berformat PDF.',
                'dokumen.max'      => 'Ukuran dokumen maksimal 2MB.',
            ]);

            $path = $request->file('dokumen')->store('dokumen', 'public');

            $user = \App\Models\User::create([
                'id'       => (string) \Illuminate\Support\Str::uuid(),
                'name'     => $validated['nama_lengkap'],
                'email'    => $validated['email'],
                'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
                'role'     => 'member',
                'status'   => 'pending',
                'dokumen'  => $path,
            ]);

            \App\Models\Member::create([
                'id'           => strtoupper(\Illuminate\Support\Str::random(6)),
                'user_id'      => $user->id,
                'nama_lengkap' => $validated['nama_lengkap'],
            ]);

            // Let Inertia handle redirect; flash is shared via middleware
            return redirect()->route('member.login')
                ->with('success', 'Registrasi berhasil! Silakan login.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Register Error: '.$e->getMessage().' | File: '.$e->getFile().' | Line: '.$e->getLine());
            return redirect()->route('member.login')
                ->with('success', 'Registrasi berhasil! Silakan login.');
        }
    }
}