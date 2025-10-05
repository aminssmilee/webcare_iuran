<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            // ✅ Hapus kolom nama_lengkap
            if (Schema::hasColumn('members', 'nama_lengkap')) {
                $table->dropColumn('nama_lengkap');
            }
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            // ✅ Kalau di-rollback, tambahkan lagi kolomnya
            $table->string('nama_lengkap')->nullable();
        });
    }
};
