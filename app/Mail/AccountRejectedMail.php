<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class AccountRejectedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $reason;

    public function __construct(User $user, string $reason)
    {
        $this->user = $user;
        $this->reason = $reason;
    }

    public function build()
    {
        return $this->subject('Status Pendaftaran: Ditolak')
                    ->view('emails.account-rejected')
                    ->with([
                        'name' => $this->user->name,
                        'reason' => $this->reason,
                    ]);
    }
}
