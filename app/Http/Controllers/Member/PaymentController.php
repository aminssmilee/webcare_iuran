<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\Iuran;

class PaymentController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $payments = Iuran::where('member_id', $user->member->id)->get();

        return response()->json([
            'message' => 'Riwayat pembayaran',
            'data' => $payments
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'jumlah' => 'required|numeric|min:1000',
            'bukti_transfer' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        $user = Auth::user();

        $path = $request->file('bukti_transfer')->store('bukti_transfer', 'public');

        $payment = Iuran::create([
            'id' => strtoupper(uniqid()),
            'member_id' => $user->member->id,
            'jumlah' => $request->jumlah,
            'status' => 'pending',
            'metode_pembayaran' => 'transfer',
            'bukti_transfer' => $path,
        ]);

        return response()->json([
            'message' => 'Pembayaran berhasil diajukan, menunggu verifikasi admin',
            'data' => $payment
        ], 201);
    }
}
