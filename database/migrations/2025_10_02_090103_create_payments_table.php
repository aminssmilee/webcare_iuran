<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->string('id', 6)->primary();
            $table->string('member_id', 6);
            $table->string('iuran_id', 6);

            $table->string('periode', 7); // format: YYYY-MM
            $table->decimal('jumlah_bayar', 12, 2);
            $table->enum('status', ['pending', 'paid', 'rejected'])->default('pending');
            $table->enum('metode', ['cash', 'transfer'])->default('transfer');
            $table->string('bukti')->nullable();
            $table->timestamps();

            $table->foreign('member_id')->references('id')->on('members')->cascadeOnDelete();
            $table->foreign('iuran_id')->references('id')->on('iurans')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
