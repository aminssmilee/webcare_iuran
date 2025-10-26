<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Tambahkan kolom baru setelah `periode`
            $table->string('periode_awal', 7)->nullable()->after('periode');
            $table->string('periode_akhir', 7)->nullable()->after('periode_awal');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['periode_awal', 'periode_akhir']);
        });
    }
};
