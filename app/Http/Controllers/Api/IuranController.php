<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Iuran;

class IuranController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'member_id' => 'required|exists:members,id',
            'jumlah' => 'required|numeric|min:1000',
            'tanggal_bayar' => 'required|date',
            'metode_pembayaran' => 'required|string',
            'bukti_transfer' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        if ($request->hasFile('bukti_transfer')) {
            $data['bukti_transfer'] = $request->file('bukti_transfer')->store('bukti_transfer', 'public');
        }

        $iuran = Iuran::create($data);

        return response()->json([
            'message' => 'Iuran berhasil dicatat',
            'data' => $iuran
        ], 201);
    }
}
