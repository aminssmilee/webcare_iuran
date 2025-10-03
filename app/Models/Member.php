<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    use HasFactory;

    protected $table = 'members';
    protected $primaryKey = 'id';
    public $incrementing = false; // karena kita pakai string random 6 huruf
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'nama_lengkap',
        'email',
        'dokumen',
        'status',
    ];
    public function user()
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }
}
