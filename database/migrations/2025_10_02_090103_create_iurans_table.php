<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('iurans', function (Blueprint $table) {
            $table->string('id', 6)->primary(); // kode iuran
            $table->string('judul');
            $table->decimal('jumlah', 12, 2);
            $table->enum('tipe', ['bulanan', 'tahunan', 'lainnya'])->default('bulanan');
            $table->text('deskripsi')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('iurans');
    }
};
