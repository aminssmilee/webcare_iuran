<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;   // ✅ tambahkan baris ini
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\Member;

class User extends Authenticatable implements MustVerifyEmail   // ✅ ubah baris ini
{
    use HasFactory, Notifiable;

    /**
     * Kolom yang boleh diisi mass-assignment
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
        'dokumen',
        'email_verified_at',
    ];

    /**
     * Kolom yang harus disembunyikan saat serialisasi
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Casting atribut
     */
    protected $casts = [
        'email_verified_at' => 'datetime', // ✅ diperlukan untuk verifikasi email
        'password' => 'hashed',
    ];

    // ==============================
    // 🔹 Relasi
    // ==============================

    public function payments()
    {
        return $this->hasMany(Payment::class, 'user_id');
    }

    public function member()
    {
        return $this->hasOne(Member::class, 'user_id', 'id');
    }

    // ==============================
    // 🔹 Helper role & status
    // ==============================

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isMember(): bool
    {
        return $this->role === 'member';
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    public function isInactive(): bool
    {
        return $this->status === 'inactive';
    }
}
