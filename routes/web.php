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
// Member Routes (hanya untuk role: member)
// ===========================
Route::middleware(['auth', 'member'])
    ->prefix('member')
    ->name('member.')
    ->group(function () {
        // Dashboard / Home Member
        Route::get('/', [MemberController::class, 'index'])->name('home');

        // Update Profil
        Route::post('/profile/update', [ProfileController::class, 'update'])->name('profile.update');

        // Halaman menunggu approval
        Route::get('/waiting-approval', fn() => Inertia::render('WaitingApproval'))->name('waiting');
        Route::post('/payments', [PaymentController::class, 'store'])->name('payments.store');
        Route::get('/payments', [\App\Http\Controllers\Member\PaymentController::class, 'index'])
            ->name('payments.index');

        // Logout
        Route::post('/logout', [LoginController::class, 'destroy'])->name('member.logout');
    });


// ===========================
// Admin Routes (auth + role:admin)
// ===========================
Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    // Route::get('/', fn() => Inertia::render('Dashboard'))->name('admin.home');
    // Route::get('/dashboard', fn() => Inertia::render('Dashboard'))->name('admin.dashboard');
    // Route::get('/users', fn() => Inertia::render('ManageUsers'))->name('admin.users');
     Route::get('/', [DashboardController::class, 'index'])->name('admin.home');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('/users', [ManageUsersController::class, 'index'])->name('admin.users');
    Route::delete('/users/{user}', [ManageUsersController::class, 'destroy'])
        ->name('admin.users.destroy');
    Route::get('/payments', fn() => Inertia::render('ManagePayments'))->name('admin.payments');
    Route::get('/reports', fn() => Inertia::render('Reports'))->name('admin.reports');

    Route::get('/pending-registrations', [RegistrationController::class, 'index'])->name('admin.registrations');
    Route::post('/registrations/{id}/approve', [RegistrationController::class, 'approve']);
    Route::post('/registrations/{id}/reject', [RegistrationController::class, 'reject']);

    Route::get('/payment-validation', [PaymentValidationController::class, 'index'])
    ->name('admin.payment.validation');

    Route::post('/registrations/{member}/approve', [RegistrationController::class, 'approve'])
        ->name('admin.registrations.approve');
    Route::post('/registrations/{member}/reject', [RegistrationController::class, 'reject'])
        ->name('admin.registrations.reject');

    // logout
    Route::post('/logout', [LoginController::class, 'destroy'])->name('admin.logout');
});
