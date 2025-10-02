<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'member_id',
        'iuran_id',
        'periode',
        'jumlah_bayar',
        'status',
        'metode',
        'bukti',
    ];

    public function member()
    {
        return $this->belongsTo(Member::class, 'member_id');
    }

    public function iuran()
    {
        return $this->belongsTo(Iuran::class, 'iuran_id');
    }
}
