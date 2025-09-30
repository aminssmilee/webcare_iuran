<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('iurans', function (Blueprint $table) {
            $table->string('id', 6)->primary();
            $table->string('member_id', 6);
            $table->decimal('jumlah', 12, 2);
            $table->date('tanggal_bayar')->nullable();
            $table->enum('status', ['pending', 'lunas', 'gagal'])->default('pending');
            $table->string('metode_pembayaran')->default('transfer');
            $table->string('bukti_transfer')->nullable();
            $table->timestamps();

            $table->foreign('member_id')->references('id')->on('members')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('iurans');
    }
};
