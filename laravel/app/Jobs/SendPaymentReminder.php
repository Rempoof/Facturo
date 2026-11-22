<?php

namespace App\Jobs;

use App\Models\Document;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendPaymentReminder implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(public Document $document, public string $language = 'FR') {}

    public function handle(): void
    {
        Mail::raw(
            "Bonjour,\n\nSauf erreur de notre part, le document {$this->document->number} d'un montant de {$this->document->total_amount} {$this->document->currency->value} reste à régler.\n\nCordialement,",
            fn ($message) => $message->to($this->document->client->email)->subject("Relance {$this->document->number}"),
        );

        $this->document->events()->create([
            'type' => 'reminded',
            'label_fr' => 'Relance envoyée au client',
            'occurred_at' => now(),
        ]);
    }
}
