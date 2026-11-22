<?php

namespace App\Jobs;

use App\Models\Document;
use App\Services\PdfRenderer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RenderDocumentPdf implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;

    public int $timeout = 120;

    public function __construct(public Document $document, public bool $store = true)
    {
        $this->onQueue('pdf');
    }

    public function handle(PdfRenderer $renderer): void
    {
        $renderer->render($this->document, $this->store);
    }
}
