<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Member;

class MemberController extends Controller
{
    public function index() {
    return response()->json([
        'message' => 'Data member berhasil diambil',
        'data' => Member::with('iurans')->paginate(10)
    ]);
}

}
