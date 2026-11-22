<?php

use App\Enums\CeilingZone;
use App\Models\Payment;
use App\Services\CeilingTracker;
use App\Services\PaymentRecorder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('counts only the MAD amount actually received in the ceiling', function () {
    [$organization, $user] = orgWithUser();
    $document = draft($organization);
    app(\App\Services\DocumentNumberingService::class)->issue($document, $user);

    app(PaymentRecorder::class)->record($document->refresh(), [
        'amount' => 1000, 'currency' => 'EUR', 'exchange_rate_to_mad' => 10.8,
        'amount_received_mad' => 10620, 'bank_fees_mad' => 180,
        'received_on' => now()->toDateString(), 'method' => 'Virement SWIFT EUR',
    ], $user);

    $ceiling = app(CeilingTracker::class)->forOrganization($organization)['ceiling'];

    expect($ceiling['collected_mad'])->toBe(10620.0)
        ->and(Payment::first()->amount_received_mad)->toEqual('10620.00');
});

it('rejects a payment without a MAD received amount', function () {
    [$organization, $user] = orgWithUser();
    $document = draft($organization);
    app(\App\Services\DocumentNumberingService::class)->issue($document, $user);

    app(PaymentRecorder::class)->record($document->refresh(), [
        'amount' => 1000, 'currency' => 'EUR', 'amount_received_mad' => 0,
        'received_on' => now()->toDateString(), 'method' => 'Virement',
    ], $user);
})->throws(\Illuminate\Validation\ValidationException::class);

it('maps the ceiling percentage to the right traffic-light zone', function () {
    expect(CeilingZone::fromPercent(12)->value)->toBe('safe')
        ->and(CeilingZone::fromPercent(71.4)->value)->toBe('vigilance')
        ->and(CeilingZone::fromPercent(86)->value)->toBe('limit');
});

it('marks an invoice as paid once the received MAD covers the total', function () {
    [$organization, $user] = orgWithUser();
    $document = draft($organization);
    app(\App\Services\DocumentNumberingService::class)->issue($document, $user);

    app(PaymentRecorder::class)->record($document->refresh(), [
        'amount' => 2000, 'currency' => 'MAD', 'amount_received_mad' => 2000,
        'received_on' => now()->toDateString(), 'method' => 'Virement RIB Maroc',
    ], $user);

    expect($document->refresh()->status->value)->toBe('paid');
});

it('refuses payments on drafts', function () {
    [$organization] = orgWithUser();
    $document = draft($organization);

    app(PaymentRecorder::class)->record($document, [
        'amount' => 100, 'currency' => 'MAD', 'amount_received_mad' => 100,
        'received_on' => now()->toDateString(), 'method' => 'Espèces',
    ], $organization->users()->first());
})->throws(\Illuminate\Validation\ValidationException::class);
