<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // ubah kolom role supaya bisa simpan institution juga
        DB::statement("ALTER TABLE users MODIFY role ENUM('admin', 'member', 'institution') NOT NULL DEFAULT 'member'");
    }

    public function down(): void
    {
        // rollback ke semula (tanpa institution)
        DB::statement("ALTER TABLE users MODIFY role ENUM('admin', 'member') NOT NULL DEFAULT 'member'");
    }
};
