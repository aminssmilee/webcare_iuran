<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_otps', function (Blueprint $table) {
            $table->id();

            // Jika users.id bertipe UUID → pakai uuid juga
            // Kalau users.id integer → ganti ke foreignId
            $table->uuid('user_id');  

            $table->string('otp_hash');                // ✅ simpan hash, bukan kode asli
            $table->string('channel')->default('email'); // ✅ email/sms/wa
            $table->string('purpose')->default('register'); // ✅ register/login/reset
            $table->boolean('is_used')->default(false); // ✅ flag cepat
            $table->timestamp('expires_at');            // ✅ waktu kadaluarsa
            $table->timestamps();

            // Optional: tambahkan indeks dan relasi
            $table->index(['user_id', 'purpose']);
            // Jika tabel users juga pakai UUID:
            // $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_otps');
    }
};
