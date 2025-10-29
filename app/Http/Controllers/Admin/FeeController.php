<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Fee;
use Inertia\Inertia;

class FeeController extends Controller
{
    public function index(Request $request)
    {
        $memberType = $request->query('member_type', 'all'); // all|perorangan|institusi
        $year       = $request->query('year', 'all');        // all|2020|2021|...
        $page       = (int) $request->query('page', 1);
        $perPage    = (int) $request->query('per_page', 10);

        $query = Fee::query()->orderByDesc('tahun')->orderBy('member_type');

        if ($memberType !== 'all' && in_array($memberType, ['perorangan', 'institusi'])) {
            $query->where('member_type', $memberType);
        }

        if ($year !== 'all' && preg_match('/^\d{4}$/', $year)) {
            $query->where('tahun', $year);
        }

        $fees = $query
            ->paginate($perPage, ['*'], 'page', $page)
            ->appends($request->only(['member_type', 'year', 'per_page']))
            ->through(function (Fee $f) {
                return [
                    'id'           => $f->id,
                    'tahun'        => (string) $f->tahun,
                    'member_type'  => $f->member_type,
                    'nominal'      => (int) $f->nominal,
                ];
            });

        // Daftar tahun yang tersedia di tabel fees
        $yearsList = Fee::select('tahun')->distinct()->orderByDesc('tahun')->pluck('tahun');

        // AJAX (axios) → JSON
        if ($request->ajax() && !$request->header('X-Inertia')) {
            return response()->json([
                'data' => $fees->items(),
                'meta' => [
                    'current_page' => $fees->currentPage(),
                    'last_page'    => $fees->lastPage(),
                    'total'        => $fees->total(),
                    'per_page'     => $fees->perPage(),
                ],
                'filters' => [
                    'member_type' => $memberType,
                    'year'        => $year,
                    'years_list'  => $yearsList,
                ],
            ]);
        }

        // Inertia (first render)
        return Inertia::render('FeeSettings', [
            'fees' => $fees,
            'filters' => [
                'member_type' => $memberType,
                'year'        => $year,
                'years_list'  => $yearsList,
            ],
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

    public function destroy(Fee $fee)
    {
        $fee->delete();

        return back()->with('success', 'Data iuran berhasil dihapus.');
    }
}

// End of file