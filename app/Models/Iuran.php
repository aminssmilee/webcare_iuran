<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasCustomId;
use App\Models\Member;

class Iuran extends Model
{
    use HasFactory, HasCustomId;

    protected $fillable = [
        'member_id','jumlah','tanggal_bayar',
        'status','metode_pembayaran','bukti_transfer'
    ];

    public function member() {
        return $this->belongsTo(Member::class);
    }
}

