<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private function uniqueExists(string $table, string $indexName): bool
    {
        $driver = config('database.default');

        if ($driver === 'mysql') {
            $result = DB::select("
                SELECT COUNT(*) as count
                FROM information_schema.STATISTICS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = ?
                  AND INDEX_NAME = ?
            ", [$table, $indexName]);
            return $result[0]->count > 0;
        }

        if ($driver === 'pgsql') {
            $result = DB::select("
                SELECT COUNT(*) as count
                FROM pg_indexes
                WHERE tablename = ?
                  AND indexname = ?
            ", [$table, $indexName]);
            return $result[0]->count > 0;
        }

        // Default fallback (anggap belum ada)
        return false;
    }

    private function foreignKeyExists(string $constraintName): bool
    {
        $driver = config('database.default');

        if ($driver === 'mysql') {
            $result = DB::select("
                SELECT COUNT(*) as count
                FROM information_schema.REFERENTIAL_CONSTRAINTS
                WHERE CONSTRAINT_SCHEMA = DATABASE()
                  AND CONSTRAINT_NAME = ?
            ", [$constraintName]);
            return $result[0]->count > 0;
        }

        if ($driver === 'pgsql') {
            $result = DB::select("
                SELECT COUNT(*) as count
                FROM information_schema.table_constraints
                WHERE constraint_type = 'FOREIGN KEY'
                  AND constraint_name = ?
            ", [$constraintName]);
            return $result[0]->count > 0;
        }

        return false;
    }

    public function up(): void
    {
        // 1️⃣ Tambahkan UNIQUE hanya jika belum ada
        if (! $this->uniqueExists('payments', 'payments_member_periode_unique')) {
            Schema::table('payments', function (Blueprint $table) {
                $table->unique(['member_id', 'periode'], 'payments_member_periode_unique');
            });
        }

        // 2️⃣ Tambahkan FOREIGN KEY hanya jika belum ada
        if (! $this->foreignKeyExists('payments_member_id_foreign')) {
            Schema::table('payments', function (Blueprint $table) {
                $table->foreign('member_id', 'payments_member_id_foreign')
                    ->references('id')
                    ->on('members')
                    ->cascadeOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            try {
                $table->dropForeign('payments_member_id_foreign');
            } catch (\Throwable $e) {
                // Ignore
            }

            try {
                $table->dropUnique('payments_member_periode_unique');
            } catch (\Throwable $e) {
                // Ignore
            }
        });
    }
};
