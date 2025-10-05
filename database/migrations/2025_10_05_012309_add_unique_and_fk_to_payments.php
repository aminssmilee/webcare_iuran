<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private function uniqueExists(string $table, string $indexName): bool
    {
        return DB::table('information_schema.STATISTICS')
            ->whereRaw('TABLE_SCHEMA = DATABASE()')
            ->where('TABLE_NAME', $table)
            ->where('INDEX_NAME', $indexName)
            ->exists();
    }

    private function foreignKeyExists(string $constraintName): bool
    {
        // Nama constraint FK unik per schema
        return DB::table('information_schema.REFERENTIAL_CONSTRAINTS')
            ->whereRaw('CONSTRAINT_SCHEMA = DATABASE()')
            ->where('CONSTRAINT_NAME', $constraintName)
            ->exists();
    }

    public function up(): void
    {
        // 1) UNIQUE (member_id, periode) — tambah hanya jika belum ada
        if (! $this->uniqueExists('payments', 'payments_member_periode_unique')) {
            Schema::table('payments', function (Blueprint $table) {
                $table->unique(['member_id', 'periode'], 'payments_member_periode_unique');
            });
        }

        // 2) FK member_id -> members(id) — tambah hanya jika belum ada
        if (! $this->foreignKeyExists('payments_member_id_foreign')) {
            Schema::table('payments', function (Blueprint $table) {
                // Pastikan tipe kolom sama: members.id & payments.member_id = VARCHAR(6)
                $table->foreign('member_id', 'payments_member_id_foreign')
                      ->references('id')->on('members')
                      ->cascadeOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Hapus FK jika ada
            try { $table->dropForeign('payments_member_id_foreign'); } catch (\Throwable $e) {}

            // Hapus UNIQUE jika ada
            try { $table->dropUnique('payments_member_periode_unique'); } catch (\Throwable $e) {}
        });
    }
};
