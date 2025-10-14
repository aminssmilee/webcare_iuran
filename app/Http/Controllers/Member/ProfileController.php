<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = Auth::user();
        $member = $user->member;

        $request->validate([
            'name'           => 'required|string|max:255',
            'nik'            => [
                'required',
                'string',
                'size:16',
                // ✅ Cegah duplikat nik antar member, tapi izinkan nik milik dirinya sendiri
                Rule::unique('members', 'nik')->ignore($member?->id),
            ],
            'tgl_lahir'      => 'required|date',
            'jenis_kelamin'  => 'required|in:L,P',
            'alamat'         => 'required|string|max:255',
            'no_wa'          => 'required|string|max:20',
            'pendidikan'     => 'required|string|max:50',
            'pekerjaan'      => 'required|string|max:100',
        ], [
            'nik.unique' => 'NIK ini sudah terdaftar di sistem.',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();
        /** @var \App\Models\Member|null $member */
        $member = $user->member;

        // ✅ Update tabel users
        $user->update([
            'name' => $request->name,
        ]);

        // ✅ Update atau buat data di tabel members
        if (!$member) {
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
            $member->update([
                'nik'           => $request->nik,
                'tgl_lahir'     => $request->tgl_lahir,
                'jenis_kelamin' => $request->jenis_kelamin,
                'alamat'        => $request->alamat,
                'no_wa'         => $request->no_wa,
                'pendidikan'    => $request->pendidikan,
                'pekerjaan'     => $request->pekerjaan,
            ]);
        }

        return back()->with('success', 'Profil berhasil diperbarui!');
    }
}
