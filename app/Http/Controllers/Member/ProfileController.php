<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $request->validate([
            'name'           => 'required|string|max:255',
            'nik'            => 'required|string|size:16',
            'tgl_lahir'      => 'required|date',
            'jenis_kelamin'  => 'required|in:L,P',
            'alamat'         => 'required|string|max:255',
            'no_wa'          => 'required|string|max:20',
            'pendidikan'     => 'required|string|max:50',
            'pekerjaan'      => 'required|string|max:100',
        ]);

        // ✅ Update tabel users

        /** @var \App\Models\User $user */
        $user = Auth::user();
        /** @var \App\Models\Member|null $member */
        $member = $user->member;

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
                // 'status'        => 'pending',
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
