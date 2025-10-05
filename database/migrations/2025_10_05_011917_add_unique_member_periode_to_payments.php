<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Tambahkan unique index: 1 member hanya boleh 1 entry per periode (YYYY-MM)
            $table->unique(['member_id', 'periode'], 'payments_member_periode_unique');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Hapus unique index saat rollback
            $table->dropUnique('payments_member_periode_unique');
            // Alternatif:
            // $table->dropUnique(['member_id', 'periode']);
        });
    }
};
