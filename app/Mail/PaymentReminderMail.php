<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Payment;

class PaymentReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public $payment;
    public $member;

    /**
     * Buat instance baru dari mail
     */
    public function __construct(Payment $payment)
    {
        $this->payment = $payment;
        $this->member = $payment->member;
    }

    /**
     * Build pesan email
     */
    public function build()
    {
        return $this->subject('Pengingat Pembayaran - Sinergi')
            ->markdown('emails.reminder_iuran')
            ->with([
                'nama'      => $this->member->nama_lengkap ?? 'Member',
                'periode'   => $this->payment->periode ?? '-',
                'jumlah'    => 'Rp ' . number_format($this->payment->jumlah_bayar ?? 0, 0, ',', '.'),
                'dueDate'   => optional($this->payment->created_at)->addDays(7)->format('d M Y'),
                'linkBayar' => route('member.payments.index'),
            ]);
    }
}
