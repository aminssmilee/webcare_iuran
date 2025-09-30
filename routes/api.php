<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\IuranController;
use App\Http\Controllers\Api\AuthController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});



// Auth
Route::post('/register', [AuthController::class,'register']);
Route::post('/login', [AuthController::class,'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class,'logout']);

    // Member & Iuran (hanya user login)
    Route::get('/members', [MemberController::class,'index']);
    Route::get('/members/{member}', [MemberController::class,'show']);
    Route::post('/iurans', [IuranController::class,'store']);
    Route::get('/iurans/history/{memberId}', [IuranController::class,'history']);
    Route::patch('/iurans/{iuran}/approve', [IuranController::class,'approve']);
});
