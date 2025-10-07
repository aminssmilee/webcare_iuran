<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AccountApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;

    /**
     * Buat konstruktor untuk menerima data user
     */
    public function __construct($user)
    {
        $this->user = $user;
    }

    /**
     * Bangun struktur email.
     */
    public function build()
    {
        return $this->subject('Akun Anda Telah Disetujui - Sinergi')
                    ->markdown('emails.account_approved')
                    ->with([
                        'userName' => $this->user->name,
                        'loginUrl' => url('/member/login'),
                    ]);
    }
}
