<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// app/Models/Payment.php

class Payment extends Model
{
    protected $table = 'payments';

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'member_id',
        'periode',        // 'YYYY-MM'
        'periode_awal',   // 'YYYY-MM'
        'periode_akhir',  // 'YYYY-MM'
        'jumlah_bayar',   // decimal(12,2)
        'status',         // pending|paid|rejected
        'metode',         // cash|transfer
        'bukti',          // path file
        'payment_status', // Pending|Completed|Failed
        'note',           // nullable text
    ];

    protected $casts = [
        'jumlah_bayar' => 'decimal:2',
    ];

    public function member()
    {
        return $this->belongsTo(\App\Models\Member::class, 'member_id', 'id');
    }
    protected $attributes = [
        'payment_status' => 'Pending',
    ];
}
