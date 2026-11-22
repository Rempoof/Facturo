<?php

namespace App\Notifications;

use App\Models\OrganizationInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrganizationInvited extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public OrganizationInvitation $invitation) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Invitation à rejoindre une organisation Facturo')
            ->line("Vous êtes invité à rejoindre une organisation avec le rôle {$this->invitation->role}.")
            ->action('Accepter l’invitation', url("/invitations/{$this->invitation->token}"))
            ->line('Ce lien expire dans 7 jours.');
    }
}
