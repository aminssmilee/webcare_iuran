<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Admin\RegistrationController;
use App\Http\Controllers\Member\MemberController;
use App\Http\Controllers\Member\ProfileController;
use App\Http\Controllers\Member\PaymentController;
use App\Http\Controllers\Admin\ManageUsersController;
use App\Http\Controllers\Admin\PaymentValidationController;
use App\Http\Controllers\Admin\DashboardController;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;

// ===================================
// 🏠 Default Route (Root Domain)
// ===================================
// Ketika user membuka domain utama (misal: http://iuran.webcare.id),
// otomatis diarahkan ke halaman login member.
Route::get('/', function () {
    return redirect()->route('member.login');
});

// ===========================
// Guest Routes (hanya untuk yang belum login)
// ===========================
Route::middleware('guest')->prefix('member')->group(function () {
    Route::get('/login', fn() => Inertia::render('LoginPage'))->name('member.login');
    Route::post('/login', [LoginController::class, 'store'])->name('member.login.store');

    Route::get('/register', fn() => Inertia::render('RegisterPage'))->name('member.register');
    Route::post('/register', [RegisterController::class, 'store'])->name('member.register.store');
});

// ===================================
// 📧 Email Verification Routes
// ===================================

// 1️⃣ Halaman instruksi setelah register
Route::get('/email/verify', function () {
    return view('auth.verify-email'); // bisa pakai Inertia juga nanti
})->middleware('auth')->name('verification.notice');

// 2️⃣ Endpoint yang dipanggil saat klik link di email
Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill(); // Menandai email sudah diverifikasi
    return redirect('/member/login')->with('success', 'Email kamu sudah terverifikasi! Silakan login.');
})->middleware(['auth', 'signed'])->name('verification.verify');

// 3️⃣ Tombol "kirim ulang" email verifikasi
Route::post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();
    return back()->with('success', 'Link verifikasi telah dikirim ulang ke email kamu.');
})->middleware(['auth', 'throttle:6,1'])->name('verification.send');

// ===========================
// Member Routes (auth + verified + member)
// ===========================
Route::middleware(['auth', 'verified', 'member'])
    ->prefix('member')
    ->name('member.')
    ->group(function () {
        Route::get('/', [MemberController::class, 'index'])->name('home');
        Route::post('/profile/update', [ProfileController::class, 'update'])->name('profile.update');
        Route::post('/payments', [PaymentController::class, 'store'])->name('payments.store');
        Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
        Route::post('/logout', [LoginController::class, 'destroy'])->name('member.logout');
    });

// ===========================
// Admin Routes (auth + admin)
// ===========================
Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('admin.home');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('/users', [ManageUsersController::class, 'index'])->name('admin.users');
    Route::delete('/users/{user}', [ManageUsersController::class, 'destroy'])->name('admin.users.destroy');
    Route::get('/payments', fn() => Inertia::render('ManagePayments'))->name('admin.payments');
    Route::get('/reports', fn() => Inertia::render('Reports'))->name('admin.reports');

    Route::get('/pending-registrations', [RegistrationController::class, 'index'])->name('admin.registrations');
    Route::post('/registrations/{id}/approve', [RegistrationController::class, 'approve']);
    Route::post('/registrations/{id}/reject', [RegistrationController::class, 'reject']);

    Route::get('/payment-validation', [PaymentValidationController::class, 'index'])->name('admin.payment.validation');

    Route::post('/registrations/{member}/approve', [RegistrationController::class, 'approve'])
        ->name('admin.registrations.approve');
    Route::post('/registrations/{member}/reject', [RegistrationController::class, 'reject'])
        ->name('admin.registrations.reject');

    Route::post('/logout', [LoginController::class, 'destroy'])->name('admin.logout');
});
