<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use App\Models\Member;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = Auth::user();
        $member = $user->member;

        // ✅ Validasi umum
        $rules = [
            'name'           => 'required|string|max:255',
            'tgl_lahir'      => 'required|date',
            'jenis_kelamin'  => 'required|in:L,P',
            'alamat'         => 'required|string|max:255',
            'no_wa'          => 'required|string|max:20',
            'pendidikan'     => 'required|string|max:50',
            'pekerjaan'      => 'required|string|max:100',
        ];

        // ✅ NIK bisa diisi hanya kalau belum pernah ada
        if (!$member || empty($member->nik)) {
            $rules['nik'] = [
                'required',
                'string',
                'size:16',
                Rule::unique('members', 'nik'),
            ];
        }

        $validated = $request->validate($rules, [
            'nik.unique' => 'NIK ini sudah terdaftar di sistem.',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();
        /** @var \App\Models\Member|null $member */
        $member = $user->member;
        
        // ✅ Update tabel users
        $user->update([
            'name' => $validated['name'],
        ]);

        // ✅ Jika member belum ada → buat baru
        if (!$member) {
            // Pastikan NIK belum dipakai
            if (Member::where('nik', $request->nik)->exists()) {
                return back()->withErrors(['nik' => 'NIK sudah digunakan oleh anggota lain.']);
            }

            $user->member()->create([
                'id'            => strtoupper(str()->random(6)),
                'user_id'       => $user->id,
                'nik'           => $request->nik,
                'tgl_lahir'     => $request->tgl_lahir,
                'jenis_kelamin' => $request->jenis_kelamin,
                'alamat'        => $request->alamat,
                'no_wa'         => $request->no_wa,
                'pendidikan'    => $request->pendidikan,
                'pekerjaan'     => $request->pekerjaan,
            ]);
        } else {
            // ✅ Kalau member sudah ada
            // Jika NIK belum diisi → izinkan isi baru
            if (empty($member->nik) && $request->filled('nik')) {
                // Cek kalau NIK belum dipakai user lain
                if (Member::where('nik', $request->nik)
                    ->where('id', '!=', $member->id)
                    ->exists()) {
                    return back()->withErrors(['nik' => 'NIK sudah digunakan oleh anggota lain.']);
                }
                $member->nik = $request->nik;
            }

            // ✅ Update field lain
            $member->tgl_lahir     = $request->tgl_lahir;
            $member->jenis_kelamin = $request->jenis_kelamin;
            $member->alamat        = $request->alamat;
            $member->no_wa         = $request->no_wa;
            $member->pendidikan    = $request->pendidikan;
            $member->pekerjaan     = $request->pekerjaan;
            $member->save();
        }

        return back()->with('success', 'Profil berhasil diperbarui!');
    }
}
