<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Payment;
use App\Mail\PaymentReminderMail;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class SendPaymentReminder extends Command
{
    protected $signature = 'payment:reminder';
    protected $description = 'Kirim email pengingat pembayaran ke member yang belum bayar';

    public function handle()
    {
        $payments = Payment::where('status', 'pending')
            ->whereDate('created_at', '<=', Carbon::today()->subDays(3)) // lebih dari 3 hari belum bayar
            ->with('member.user')
            ->get();

        foreach ($payments as $payment) {
            $user = $payment->member->user ?? null;
            if ($user && $user->email) {
                Mail::to($user->email)->send(new PaymentReminderMail($payment));
                $this->info("Email dikirim ke: {$user->email}");
            }
        }

        $this->info('Semua reminder pembayaran telah dikirim.');
        return Command::SUCCESS;
    }
}
