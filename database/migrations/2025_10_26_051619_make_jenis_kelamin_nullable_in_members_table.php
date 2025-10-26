<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            // Ubah kolom jenis_kelamin agar bisa NULL
            $table->char('jenis_kelamin', 1)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            // Kembalikan lagi ke NOT NULL jika rollback
            $table->char('jenis_kelamin', 1)->nullable(false)->change();
        });
    }
};
