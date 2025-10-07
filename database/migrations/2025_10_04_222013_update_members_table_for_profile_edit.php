<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            // Ubah nama kolom hp → no_wa secara manual (MariaDB kompatibel)
            if (Schema::hasColumn('members', 'hp')) {
                $table->string('no_wa', 255)->nullable()->after('alamat');
            }

            // Ubah kolom tgl_lahir agar sesuai dengan form (kalau mau)
            if (!Schema::hasColumn('members', 'ttl') && Schema::hasColumn('members', 'tgl_lahir')) {
                // biarkan saja, sudah sesuai
            }

            // Tambah kolom jika belum ada
            if (!Schema::hasColumn('members', 'nama_lengkap')) {
                $table->string('nama_lengkap')->nullable()->after('nik');
            }
        });

        // Salin isi kolom lama hp → no_wa
        
        DB::statement('UPDATE members SET no_wa = hp WHERE hp IS NOT NULL');

        // Hapus kolom hp lama
        Schema::table('members', function (Blueprint $table) {
            if (Schema::hasColumn('members', 'hp')) {
                $table->dropColumn('hp');
            }
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            if (!Schema::hasColumn('members', 'hp')) {
                $table->string('hp', 255)->nullable()->after('alamat');
            }

            if (Schema::hasColumn('members', 'no_wa')) {
                $table->dropColumn('no_wa');
            }
        });
    }
};
