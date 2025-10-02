<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Iuran extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'judul',
        'jumlah',
        'tipe',
        'deskripsi',
    ];

    public function payments()
    {
        return $this->hasMany(Payment::class, 'iuran_id');
    }
}
