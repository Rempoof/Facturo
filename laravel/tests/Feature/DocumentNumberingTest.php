<?php

use App\Enums\DocumentType;
use App\Models\Client;
use App\Models\Document;
use App\Models\Organization;
use App\Models\User;
use App\Services\DocumentCalculator;
use App\Services\DocumentNumberingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;

uses(RefreshDatabase::class);

function orgWithUser(): array
{
    $organization = Organization::create([
        'name' => 'Test AE', 'ice' => '000000000000001', 'annual_ceiling_mad' => 200000,
        'bank_accounts' => [], 'legal_mentions' => [], 'activity_category' => 'services',
    ]);
    $user = User::create([
        'name' => 'Test', 'email' => 'test@example.ma', 'password' => bcrypt('Password!2026'),
        'current_organization_id' => $organization->id,
    ]);
    $organization->users()->attach($user->id, ['role' => 'owner']);

    return [$organization, $user];
}

function draft(Organization $organization): Document
{
    $client = Client::create([
        'organization_id' => $organization->id, 'name' => 'Client', 'type' => 'company_ma',
        'country_code' => 'MA', 'preferred_language' => 'FR', 'default_currency' => 'MAD',
    ]);

    $totals = app(DocumentCalculator::class)->totals([['quantity' => 2, 'unit_price' => 1000]]);

    return $organization->documents()->create([
        'client_id' => $client->id, 'type' => DocumentType::Facture, 'status' => 'draft',
        'language' => 'FR', 'currency' => 'MAD', 'exchange_rate_to_mad' => 1,
        'issue_date' => '2026-03-10', 'due_date' => '2026-04-09',
        'subtotal' => $totals['subtotal'], 'total_amount' => $totals['total'],
        'indicative_mad_amount' => $totals['indicative_mad'], 'vat_regime' => 'franchise_ae',
        'payment_method' => 'Virement', 'payment_terms' => '30 jours',
    ]);
}

it('never consumes a number for a draft', function () {
    [$organization] = orgWithUser();
    $document = draft($organization);

    expect($document->number)->toBeNull()
        ->and($document->is_locked)->toBeFalse()
        ->and($document->displayNumber())->toBe('Attribué à l’émission');
});

it('assigns the first sequential number on issue', function () {
    [$organization, $user] = orgWithUser();
    $document = draft($organization);

    app(DocumentNumberingService::class)->issue($document, $user);

    expect($document->refresh()->number)->toBe('FAC-2026-0001')
        ->and($document->is_locked)->toBeTrue()
        ->and($document->status->value)->toBe('sent');
});

it('increments numbers without gaps across two documents', function () {
    [$organization, $user] = orgWithUser();
    $numbering = app(DocumentNumberingService::class);

    $first = draft($organization);
    $second = draft($organization);

    $numbering->issue($first, $user);
    $numbering->issue($second, $user);

    expect($first->refresh()->number)->toBe('FAC-2026-0001')
        ->and($second->refresh()->number)->toBe('FAC-2026-0002');
});

it('refuses to issue an already locked document', function () {
    [$organization, $user] = orgWithUser();
    $document = draft($organization);
    $numbering = app(DocumentNumberingService::class);

    $numbering->issue($document, $user);
    $numbering->issue($document->refresh(), $user);
})->throws(ValidationException::class);

it('keeps separate sequences per document type', function () {
    [$organization, $user] = orgWithUser();
    $numbering = app(DocumentNumberingService::class);

    $invoice = draft($organization);
    $quote = draft($organization);
    $quote->forceFill(['type' => DocumentType::Devis])->save();

    $numbering->issue($invoice, $user);
    $numbering->issue($quote->refresh(), $user);

    expect($invoice->refresh()->number)->toBe('FAC-2026-0001')
        ->and($quote->refresh()->number)->toBe('DEV-2026-0001');
});
