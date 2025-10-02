<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;

// ===========================
// Guest Routes (hanya untuk yang belum login)
// ===========================
Route::middleware('guest')->prefix('member')->group(function () {
    Route::get('/login', fn() => Inertia::render('LoginPage'))->name('member.login');
    Route::post('/login', [LoginController::class, 'store'])->name('member.login.store');

    Route::get('/register', fn() => Inertia::render('RegisterPage'))->name('member.register');
    Route::post('/register', [RegisterController::class, 'store'])->name('member.register.store');
});

// ===========================
// Member Routes (hanya untuk yang sudah login)
// ===========================
Route::middleware('auth')->prefix('member')->group(function () {
    Route::get('/', fn() => Inertia::render('MemberPayment'))->name('member.home');
    Route::get('/waiting-approval', fn() => Inertia::render('WaitingApproval'))->name('member.waiting');

    // logout (POST agar aman)
    Route::post('/logout', [LoginController::class, 'destroy'])->name('member.logout');
});

// ===========================
// Admin Routes (hanya untuk admin login)
// ===========================
Route::middleware('auth')->prefix('admin')->group(function () {
    Route::get('/', fn() => Inertia::render('Dashboard'))->name('admin.home');
    Route::get('/dashboard', fn() => Inertia::render('Dashboard'))->name('admin.dashboard');
    Route::get('/users', fn() => Inertia::render('ManageUsers'))->name('admin.users');
    Route::get('/payments', fn() => Inertia::render('ManagePayments'))->name('admin.payments');
    Route::get('/reports', fn() => Inertia::render('Reports'))->name('admin.reports');
});

Route::get('/payment-validation', function () {
    return Inertia::render('PaymentValidation');
});
