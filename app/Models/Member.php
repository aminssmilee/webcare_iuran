<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasCustomId;
use App\Models\Iuran;

class Member extends Model
{
    use HasFactory, HasCustomId;

    protected $fillable = [
        'nama_lengkap','nik','tgl_lahir','jenis_kelamin',
        'alamat','hp','email','pendidikan','pekerjaan',
        'dokumen','status'
    ];

    public function iurans() {
        return $this->hasMany(Iuran::class);
    }
}

