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

        // =====================================================
        // 🧠 Tentukan role user
        // =====================================================
        $isInstitution = $user->role === 'institution';

        // =====================================================
        // ✅ Validasi dinamis sesuai role
        // =====================================================
        $rules = [
            'name'           => 'required|string|max:255',
            'tgl_lahir'      => 'required|date', // tetap wajib untuk semua
            'alamat'         => 'required|string|max:255',
            'no_wa'          => 'required|string|max:20',
            'pendidikan'     => 'required|string|max:50',
            'pekerjaan'      => 'required|string|max:100',
        ];

        // 🔹 Jenis kelamin hanya wajib untuk perorangan
        $rules['jenis_kelamin'] = $isInstitution
            ? 'nullable|in:L,P'
            : 'required|in:L,P';

        // 🔹 NIK hanya wajib kalau belum pernah diisi
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

        // =====================================================
        // ✅ Update tabel users (nama)
        // =====================================================
        $user->update([
            'name' => $validated['name'],
        ]);

        // =====================================================
        // ✅ Jika member belum ada → buat baru
        // =====================================================
        if (!$member) {
            if (isset($validated['nik']) && Member::where('nik', $validated['nik'])->exists()) {
                return back()->withErrors(['nik' => 'NIK sudah digunakan oleh anggota lain.']);
            }

            $user->member()->create([
                'id'            => strtoupper(str()->random(6)),
                'user_id'       => $user->id,
                'nik'           => $validated['nik'] ?? null,
                'tgl_lahir'     => $validated['tgl_lahir'],
                'jenis_kelamin' => $validated['jenis_kelamin'] ?? null, // boleh kosong kalau institusi
                'alamat'        => $validated['alamat'],
                'no_wa'         => $validated['no_wa'],
                'pendidikan'    => $validated['pendidikan'],
                'pekerjaan'     => $validated['pekerjaan'],
            ]);
        } else {
            // =====================================================
            // ✅ Kalau member sudah ada, update data-nya
            // =====================================================

            if (empty($member->nik) && $request->filled('nik')) {
                if (Member::where('nik', $request->nik)
                    ->where('id', '!=', $member->id)
                    ->exists()) {
                    return back()->withErrors(['nik' => 'NIK sudah digunakan oleh anggota lain.']);
                }
                $member->nik = $request->nik;
            }

            $member->tgl_lahir = $validated['tgl_lahir'];
            if (!$isInstitution) {
                $member->jenis_kelamin = $validated['jenis_kelamin'];
            }

            $member->alamat     = $validated['alamat'];
            $member->no_wa      = $validated['no_wa'];
            $member->pendidikan = $validated['pendidikan'];
            $member->pekerjaan  = $validated['pekerjaan'];
            $member->save();
        }

        return back()->with('success', 'Profil berhasil diperbarui!');
    }
}
