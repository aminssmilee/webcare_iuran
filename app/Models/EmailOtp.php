<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailOtp extends Model
{
    protected $fillable = [
        'user_id',
        'otp_hash',
        'channel',
        'purpose',
        'is_used',
        'expires_at',
    ];

    protected $casts = [
        'is_used' => 'boolean',
        'expires_at' => 'datetime',
    ];

    // 🔹 Relasi opsional ke user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // 🔹 Helper untuk cek OTP kadaluarsa
    public function isExpired()
    {
        return $this->expires_at->isPast();
    }
}
