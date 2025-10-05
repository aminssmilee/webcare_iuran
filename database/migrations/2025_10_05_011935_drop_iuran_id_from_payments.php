<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            if (Schema::hasColumn('payments', 'iuran_id')) {
                // Hapus foreign key (nama default: payments_iuran_id_foreign)
                try {
                    $table->dropForeign(['iuran_id']);
                } catch (\Throwable $e) {
                    // abaikan jika FK sudah terhapus
                }
                // Hapus kolom
                $table->dropColumn('iuran_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            if (!Schema::hasColumn('payments', 'iuran_id')) {
                $table->string('iuran_id', 6)->nullable();
                // Pasang lagi FK jika perlu
                $table->foreign('iuran_id')->references('id')->on('iurans')->cascadeOnDelete();
            }
        });
    }
};
