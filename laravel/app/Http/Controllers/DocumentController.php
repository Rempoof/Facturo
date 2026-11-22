<?php

namespace App\Http\Controllers;

use App\Enums\Currency;
use App\Enums\DocumentType;
use App\Http\Requests\StoreDocumentRequest;
use App\Jobs\RenderDocumentPdf;
use App\Jobs\SendDocumentEmail;
use App\Models\Client;
use App\Models\Document;
use App\Models\Organization;
use App\Models\Project;
use App\Services\DocumentCalculator;
use App\Services\DocumentNumberingService;
use App\Services\PdfRenderer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class DocumentController extends Controller
{
    public function index(Request $request, Organization $organization): Response
    {
        $documents = $organization->documents()
            ->with('client:id,name,country_code')
            ->when($request->string('type')->toString(), fn ($q, $type) => $q->where('type', $type))
            ->when($request->string('status')->toString(), fn ($q, $status) => $q->where('status', $status))
            ->when($request->integer('client_id'), fn ($q, $client) => $q->where('client_id', $client))
            ->when($request->string('currency')->toString(), fn ($q, $currency) => $q->where('currency', $currency))
            ->when($request->string('search')->toString(), function ($q, $search) {
                $q->where(fn ($inner) => $inner->where('number', 'ilike', "%{$search}%")
                    ->orWhereHas('client', fn ($c) => $c->where('name', 'ilike', "%{$search}%")));
            })
            ->latest('issue_date')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Documents/Index', [
            'documents' => $documents,
            'clients' => $organization->clients()->orderBy('name')->get(['id', 'name', 'country_code']),
            'filters' => $request->only('type', 'status', 'client_id', 'currency', 'search'),
        ]);
    }

    public function create(Request $request, Organization $organization, DocumentNumberingService $numbering): Response
    {
        $type = DocumentType::tryFrom($request->string('type', 'facture')->toString()) ?? DocumentType::Facture;
        $clientId = $request->integer('client_id');
        $projectId = $request->integer('project_id');
        $client = $clientId ? $organization->clients()->find($clientId) : $organization->clients()->first();
        $project = $projectId ? $organization->projects()->with('tasks')->find($projectId) : null;

        $currency = Currency::tryFrom($client?->default_currency ?? 'MAD') ?? Currency::MAD;

        return Inertia::render('Documents/Create', [
            'type' => $type->value,
            'numberPreview' => $numbering->nextPreview($organization, $type, now()->year),
            'clients' => $organization->clients()->orderBy('name')->get(),
            'projects' => $organization->projects()->with('tasks')->get(),
            'services' => $organization->services()->orderBy('code')->get(),
            'defaults' => [
                'client_id' => $client?->id,
                'project_id' => $project?->id,
                'language' => $client?->preferred_language ?? 'FR',
                'currency' => $currency->value,
                'exchange_rate_to_mad' => $currency->defaultRateToMad(),
                'issue_date' => now()->toDateString(),
                'due_date' => now()->addDays(30)->toDateString(),
                'vat_regime' => $client?->isMoroccan() ? 'franchise_ae' : 'export_hors_champ',
                'bank_account_key' => $organization->bankAccountFor($currency->value)['key'] ?? null,
                'lines' => $project
                    ? $project->tasks->map(fn ($task) => [
                        'designation' => $task->title,
                        'unit' => $task->unit,
                        'quantity' => (float) $task->quantity,
                        'unit_price' => (float) $task->unit_price,
                        'discount_pct' => 0,
                    ])->all()
                    : [[
                        'designation' => '',
                        'unit' => 'jour',
                        'quantity' => 1,
                        'unit_price' => 0,
                        'discount_pct' => 0,
                    ]],
            ],
            'legalMentions' => $organization->legal_mentions,
            'bankAccounts' => $organization->bank_accounts,
        ]);
    }

    public function store(
        StoreDocumentRequest $request,
        Organization $organization,
        DocumentCalculator $calculator,
        DocumentNumberingService $numbering,
    ): RedirectResponse {
        $data = $request->validated();
        $type = DocumentType::from($data['type']);
        $currency = Currency::from($data['currency']);

        $totals = $calculator->totals(
            lines: $data['lines'],
            globalDiscountPct: (float) ($data['global_discount_pct'] ?? 0),
            depositPct: (float) ($data['deposit_requested_pct'] ?? 0),
            type: $type,
            currency: $currency,
            rateToMad: (float) ($data['exchange_rate_to_mad'] ?? $currency->defaultRateToMad()),
            withDeposit: in_array($type, [DocumentType::Devis, DocumentType::Acompte], true),
        );

        $document = DB::transaction(function () use ($data, $organization, $totals, $calculator, $type, $currency, $request) {
            $document = $organization->documents()->create([
                'client_id' => $data['client_id'],
                'project_id' => $data['project_id'] ?? null,
                'created_by' => $request->user()->id,
                'type' => $type,
                'status' => 'draft',
                'is_locked' => false,
                'language' => $data['language'],
                'currency' => $currency,
                'exchange_rate_to_mad' => $data['exchange_rate_to_mad'] ?? $currency->defaultRateToMad(),
                'issue_date' => $data['issue_date'],
                'due_date' => $data['due_date'],
                'global_discount_pct' => $data['global_discount_pct'] ?? 0,
                'deposit_requested_pct' => $data['deposit_requested_pct'] ?? 0,
                'subtotal' => $totals['subtotal'],
                'discount_amount' => $totals['discount_amount'],
                'total_amount' => $totals['total'],
                'indicative_mad_amount' => $totals['indicative_mad'],
                'vat_regime' => $data['vat_regime'],
                'legal_mention' => $data['legal_mention']
                    ?? $organization->legalMentionFor($data['vat_regime'], $data['language']),
                'payment_method' => $data['payment_method'],
                'payment_terms' => $data['payment_terms'],
                'bank_account_key' => $data['bank_account_key'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($data['lines'] as $index => $line) {
                $document->lines()->create([
                    'position' => $index,
                    'designation' => $line['designation'],
                    'unit' => $line['unit'],
                    'quantity' => $line['quantity'],
                    'unit_price' => $line['unit_price'],
                    'discount_pct' => $line['discount_pct'] ?? 0,
                    'line_total' => round((float) $line['quantity'] * (float) $line['unit_price'] * (1 - ((float) ($line['discount_pct'] ?? 0) / 100)), 2),
                ]);
            }

            $document->events()->create([
                'user_id' => $request->user()->id,
                'type' => 'created',
                'label_fr' => 'Brouillon enregistré',
                'occurred_at' => now(),
            ]);

            if ($request->boolean('issue_now')) {
                app(DocumentNumberingService::class)->issue($document, $request->user());
                dispatch(new RenderDocumentPdf($document->refresh()));
                dispatch(new SendDocumentEmail($document->refresh()));
            }

            return $document;
        });

        return redirect()
            ->route('documents.show', ['organization' => $organization->slug, 'document' => $document->id])
            ->with('success', $document->is_locked
                ? "Document émis et verrouillé sous le numéro {$document->number}."
                : 'Brouillon enregistré : aucun numéro consommé.');
    }

    public function show(Organization $organization, Document $document): Response
    {
        abort_unless($document->organization_id === $organization->id, 404);
        $document->load(['client', 'lines', 'payments', 'events', 'project']);

        return Inertia::render('Documents/Show', [
            'document' => $document,
            'bank' => $organization->bankAccountFor($document->currency->value),
            'receivedMad' => $document->receivedMad(),
            'remainingMad' => $document->remainingMad(),
            'paymentMethods' => ['Virement bancaire RIB Maroc', 'Virement SEPA / SWIFT', 'Chèque bancaire', 'Espèces'],
        ]);
    }

    public function issue(Request $request, Organization $organization, Document $document, DocumentNumberingService $numbering): RedirectResponse
    {
        $this->authorize('issue', $document);
        $numbering->issue($document, $request->user());

        return back()->with('success', "Document verrouillé : {$document->refresh()->number}.");
    }

    public function convert(Request $request, Organization $organization, Document $document): RedirectResponse
    {
        $this->authorize('view', $document);
        $target = DocumentType::tryFrom($request->string('type', 'facture')->toString()) ?? DocumentType::Facture;

        $copy = DB::transaction(function () use ($document, $target, $organization, $request) {
            $copy = $organization->documents()->create([
                ...$document->only([
                    'client_id', 'project_id', 'language', 'currency', 'exchange_rate_to_mad',
                    'global_discount_pct', 'deposit_requested_pct', 'vat_regime', 'legal_mention',
                    'payment_method', 'payment_terms', 'bank_account_key',
                ]),
                'type' => $target,
                'status' => 'draft',
                'is_locked' => false,
                'number' => null,
                'issue_date' => now()->toDateString(),
                'due_date' => now()->addDays(30)->toDateString(),
                'subtotal' => $document->subtotal,
                'discount_amount' => $document->discount_amount,
                'total_amount' => $document->total_amount,
                'indicative_mad_amount' => $document->indicative_mad_amount,
                'created_by' => $request->user()->id,
                'notes' => $target === DocumentType::Avoir
                    ? "Avoir relatif au document {$document->number}."
                    : "Document créé depuis {$document->displayNumber()}.",
            ]);

            foreach ($document->lines as $line) {
                $copy->lines()->create($line->only(['position', 'designation', 'unit', 'quantity', 'unit_price', 'discount_pct', 'line_total']));
            }

            $copy->events()->create([
                'user_id' => $request->user()->id,
                'type' => 'created',
                'label_fr' => 'Brouillon créé par conversion',
                'occurred_at' => now(),
            ]);

            return $copy;
        });

        return redirect()
            ->route('documents.show', ['organization' => $organization->slug, 'document' => $copy->id])
            ->with('success', 'Brouillon créé : vérifiez-le avant émission.');
    }

    public function pdf(Organization $organization, Document $document, PdfRenderer $renderer): HttpResponse
    {
        abort_unless($document->organization_id === $organization->id, 404);

        return response($renderer->render($document, store: false), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "inline; filename=\"{$document->number}.pdf\"",
        ]);
    }
}
