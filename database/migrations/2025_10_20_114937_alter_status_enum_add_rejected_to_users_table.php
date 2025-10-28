<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        $driver = config('database.default');

        // 1️⃣ Ubah definisi kolom status jadi lebih fleksibel (string)
        // supaya ENUM tidak bikin error di PostgreSQL
        if (Schema::hasColumn('users', 'status')) {
            Schema::table('users', function ($table) {
                $table->string('status', 20)->default('pending')->change();
            });
        }

        // 2️⃣ Update data lama (inactive → rejected)
        DB::table('users')
            ->where('status', 'inactive')
            ->update(['status' => 'rejected']);

        // 3️⃣ MySQL khusus → ubah enum
        if ($driver === 'mysql') {
            DB::statement("
                ALTER TABLE users 
                MODIFY COLUMN status 
                ENUM('pending', 'active', 'rejected') 
                NOT NULL DEFAULT 'pending'
            ");
        }

        // PostgreSQL tidak perlu enum; cukup string biasa
    }

    public function down(): void
    {
        $driver = config('database.default');

        // Kembalikan status "rejected" jadi "inactive"
        DB::table('users')
            ->where('status', 'rejected')
            ->update(['status' => 'inactive']);

        // Ubah enum balik (MySQL)
        if ($driver === 'mysql') {
            DB::statement("
                ALTER TABLE users 
                MODIFY COLUMN status 
                ENUM('pending', 'active', 'inactive') 
                NOT NULL DEFAULT 'pending'
            ");
        } else {
            // PostgreSQL → biarkan tetap string
            Schema::table('users', function ($table) {
                $table->string('status', 20)->default('pending')->change();
            });
        }
    }
};
