<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration {
    public function up(): void
    {
        // 1️⃣ Ubah definisi enum dulu → tambahkan "rejected"
        DB::statement("
            ALTER TABLE users 
            MODIFY COLUMN status 
            ENUM('pending', 'active', 'inactive', 'rejected') 
            NOT NULL DEFAULT 'pending'
        ");

        // 2️⃣ Baru ubah semua data lama "inactive" menjadi "rejected"
        DB::table('users')
            ->where('status', 'inactive')
            ->update(['status' => 'rejected']);

        // 3️⃣ Lalu hilangkan kembali "inactive" dari enum (optional, bisa di-skip)
        DB::statement("
            ALTER TABLE users 
            MODIFY COLUMN status 
            ENUM('pending', 'active', 'rejected') 
            NOT NULL DEFAULT 'pending'
        ");
    }

    public function down(): void
    {
        // Rollback ke versi sebelumnya
        DB::statement("
            ALTER TABLE users 
            MODIFY COLUMN status 
            ENUM('pending', 'active', 'inactive') 
            NOT NULL DEFAULT 'pending'
        ");

        // Kembalikan data yang 'rejected' jadi 'inactive'
        DB::table('users')
            ->where('status', 'rejected')
            ->update(['status' => 'inactive']);
    }
};
