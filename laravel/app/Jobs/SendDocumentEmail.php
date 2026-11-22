<?php

namespace App\Jobs;

use App\Models\Document;
use App\Services\PdfRenderer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendDocumentEmail implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(public Document $document) {}

    public function handle(PdfRenderer $renderer): void
    {
        $pdf = $renderer->render($this->document, store: false);

        Mail::raw(
            "Bonjour {$this->document->client->contact_name},\n\nVeuillez trouver ci-joint votre document {$this->document->number}.\n\nCordialement,",
            function ($message) use ($pdf) {
                $message->to($this->document->client->email)
                    ->subject("{$this->document->number} — {$this->document->organization->name}")
                    ->attachData($pdf, "{$this->document->number}.pdf", ['mime' => 'application/pdf']);
            },
        );

        $this->document->forceFill(['sent_at' => now()])->save();
        $this->document->events()->create([
            'type' => 'sent',
            'label_fr' => 'Envoyé par e-mail au client',
            'occurred_at' => now(),
        ]);
    }
}
