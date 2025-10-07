<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Tambahkan status jika belum ada
            if (!Schema::hasColumn('users', 'status')) {
                $table->enum('status', ['pending', 'active', 'inactive'])
                      ->default('pending')
                      ->after('role');
            }

            // Tambahkan dokumen jika belum ada
            if (!Schema::hasColumn('users', 'dokumen')) {
                $table->string('dokumen')->nullable()->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'status')) {
                $table->dropColumn('status');
            }

            if (Schema::hasColumn('users', 'dokumen')) {
                $table->dropColumn('dokumen');
            }
        });
    }
};
