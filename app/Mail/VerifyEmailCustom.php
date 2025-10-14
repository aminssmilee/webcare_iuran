<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerifyEmailCustom extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $actionUrl;

    public function __construct($user, $actionUrl)
    {
        $this->user = $user;
        $this->actionUrl = $actionUrl;
    }

    public function build()
    {
        return $this->subject('Verifikasi Email Anda - Sinergi Inovasi')
                    ->view('emails.verify_email')
                    ->with([
                        'user' => $this->user,
                        'actionUrl' => $this->actionUrl,
                    ]);
    }
}
