<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends ResetPassword
{
    public function toMail(mixed $notifiable): MailMessage
    {
        $url = $this->resetUrl($notifiable);

        return (new MailMessage)
            ->subject('パスワード再設定のご案内')
            ->greeting('こんにちは！')
            ->line('パスワード再設定のリクエストを受け付けました。')
            ->action('パスワードを再設定する', $url)
            ->line("このリンクの有効期限は {$this->expireMinutes()} 分です。")
            ->line('心当たりがない場合は、このメールを無視してください。')
            ->salutation('Project Tracker');
    }

    protected function expireMinutes(): int
    {
        return config('auth.passwords.'.config('auth.defaults.passwords').'.expire');
    }
}
