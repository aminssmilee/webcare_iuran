<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public $otpCode;

    public function __construct($otpCode)
    {
        $this->otpCode = $otpCode;
    }

    public function build()
    {
        return $this->subject('🔒 Kode OTP Verifikasi Akun Anda')
            ->view('emails.otp')
            ->with([
                'otpCode' => $this->otpCode,
                'validMinutes' => 10,
                'appName' => config('app.name', 'Forsinergi'),
            ]);
    }
}
