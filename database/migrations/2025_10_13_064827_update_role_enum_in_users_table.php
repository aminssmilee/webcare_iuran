<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $driver = config('database.default');

        // 🔹 Pastikan kolom 'role' ada
        if (Schema::hasColumn('users', 'role')) {
            // Ubah ke string supaya aman di PostgreSQL
            Schema::table('users', function ($table) {
                $table->string('role', 20)->default('member')->change();
            });
        }

        // 🔹 Khusus MySQL: ubah jadi ENUM
        if ($driver === 'mysql') {
            DB::statement("
                ALTER TABLE users 
                MODIFY COLUMN role 
                ENUM('admin', 'member', 'institution') 
                NOT NULL DEFAULT 'member'
            ");
        }
    }

    public function down(): void
    {
        $driver = config('database.default');

        // 🔹 Rollback ke versi lama
        if ($driver === 'mysql') {
            DB::statement("
                ALTER TABLE users 
                MODIFY COLUMN role 
                ENUM('admin', 'member') 
                NOT NULL DEFAULT 'member'
            ");
        } else {
            // PostgreSQL tetap string
            Schema::table('users', function ($table) {
                $table->string('role', 20)->default('member')->change();
            });
        }
    }
};
