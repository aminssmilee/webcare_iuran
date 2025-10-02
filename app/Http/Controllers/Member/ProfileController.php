<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show()
    {
        $user = Auth::user();

        return response()->json([
            'message' => 'Data profile',
            'data' => $user->member
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();
        $member = $user->member;

        $request->validate([
            'nama_lengkap' => 'sometimes|string|max:255',
            'alamat' => 'sometimes|string',
            'hp' => 'sometimes|string|max:20',
            'dokumen' => 'nullable|file|mimes:pdf,doc,docx|max:2048'
        ]);

        if ($request->hasFile('dokumen')) {
            $path = $request->file('dokumen')->store('dokumen', 'public');
            $member->dokumen = $path;
        }

        $member->update($request->except(['dokumen']));

        return response()->json([
            'message' => 'Profile berhasil diperbarui',
            'data' => $member
        ]);
    }
}
