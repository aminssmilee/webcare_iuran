<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    use HasFactory;

    protected $table = 'members';
    protected $primaryKey = 'id';

    // ⚠️ Kalau kamu pakai ID random string, tetap gunakan ini:
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'nik',
        'tgl_lahir',
        'jenis_kelamin',
        'alamat',
        'no_wa',
        'pendidikan',
        'pekerjaan',
    ];
    protected $casts = [
        'tgl_lahir' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
}
