<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed', // Laravel 10+ auto hash
    ];

    // Hash password otomatis kalau belum pakai casts (Laravel < 10)
    protected static function booted()
    {
        static::creating(function ($user) {
            if ($user->password) {
                $user->password = Hash::make($user->password);
            }

            // default role = member kalau tidak diisi
            if (!$user->role) {
                $user->role = 'member';
            }
        });

        static::updating(function ($user) {
            if ($user->isDirty('password')) {
                $user->password = Hash::make($user->password);
            }
        });
    }

    // Relasi dengan tabel Member
    public function member()
    {
        return $this->hasOne(\App\Models\Member::class, 'user_id');
    }

    // Contoh relasi tambahan
    public function payments()
    {
        return $this->hasMany(\App\Models\Payment::class, 'user_id');
    }
}
