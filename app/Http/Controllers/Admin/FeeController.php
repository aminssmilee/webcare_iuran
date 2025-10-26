<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Fee;
use Inertia\Inertia;

class FeeController extends Controller
{
    public function index()
    {
        $fees = Fee::orderByDesc('tahun')->get();

        return Inertia::render('Admin/FeePage', [
            'fees' => $fees
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'member_type' => 'required|in:institusi,perorangan',
            'tahun' => 'required|integer|min:2020|max:2100',
            'nominal' => 'required|numeric|min:0',
        ]);

        Fee::updateOrCreate(
            [
                'member_type' => $request->member_type,
                'tahun' => $request->tahun,
            ],
            [
                'nominal' => $request->nominal,
            ]
        );

        return back()->with('success', 'Data iuran berhasil disimpan.');
    }
}
