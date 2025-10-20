<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        $driver = DB::getDriverName();

        Schema::table('payments', function (Blueprint $table) use ($driver) {
            // 1️⃣ Pastikan kolom member_id ada
            if (!Schema::hasColumn('payments', 'member_id')) {
                $table->string('member_id', 6)->after('id');
            }

            // 2️⃣ Drop FK lama (jika ada)
            try {
                if ($driver === 'pgsql') {
                    DB::statement('ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_member_id_foreign');
                } else {
                    $table->dropForeign(['member_id']);
                }
            } catch (\Throwable $e) {}

            // 3️⃣ Tambah FK baru
            $table->foreign('member_id')
                ->references('id')
                ->on('members')
                ->onDelete('cascade');

            // 4️⃣ Drop unique lama (MySQL & PostgreSQL versi)
            try {
                if ($driver === 'pgsql') {
                    DB::statement('ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_member_periode_unique');
                    DB::statement('ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_member_id_periode_unique');
                } else {
                    DB::statement('ALTER TABLE payments DROP INDEX IF EXISTS payments_member_periode_unique');
                    DB::statement('ALTER TABLE payments DROP INDEX IF EXISTS payments_member_id_periode_unique');
                }
            } catch (\Throwable $e) {}

            // 5️⃣ Tambah unique baru
            $table->unique(['member_id', 'periode'], 'payments_member_periode_unique');
        });

        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        $driver = DB::getDriverName();

        Schema::table('payments', function (Blueprint $table) use ($driver) {
            try {
                if ($driver === 'pgsql') {
                    DB::statement('ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_member_id_foreign');
                    DB::statement('ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_member_periode_unique');
                } else {
                    $table->dropForeign(['member_id']);
                    $table->dropUnique('payments_member_periode_unique');
                }
            } catch (\Throwable $e) {}
        });

        Schema::enableForeignKeyConstraints();
    }
};
