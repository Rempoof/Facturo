<?php

namespace App\Services;

use App\Enums\DocumentStatus;
use App\Models\Document;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Records a settlement. The MAD amount actually received on the Moroccan bank
 * account is mandatory and is the only value that feeds the annual ceiling.
 */
class PaymentRecorder
{
    public function record(Document $document, array $data, User $actor): Payment
    {
        if (! $document->is_locked) {
            throw ValidationException::withMessages([
                'document' => "Un brouillon ne peut pas recevoir de paiement : émettez-le d'abord.",
            ]);
        }

        if ((float) $data['amount_received_mad'] <= 0) {
            throw ValidationException::withMessages([
                'amount_received_mad' => 'Le montant reçu en MAD doit être supérieur à 0.',
            ]);
        }

        return DB::transaction(function () use ($document, $data, $actor) {
            $payment = Payment::create([
                'organization_id' => $document->organization_id,
                'document_id' => $document->id,
                'recorded_by' => $actor->id,
                'amount' => $data['amount'],
                'currency' => $data['currency'] ?? $document->currency->value,
                'exchange_rate_to_mad' => $data['exchange_rate_to_mad'] ?? $document->exchange_rate_to_mad,
                'amount_received_mad' => $data['amount_received_mad'],
                'bank_fees_mad' => $data['bank_fees_mad'] ?? 0,
                'received_on' => $data['received_on'],
                'method' => $data['method'],
                'reference' => $data['reference'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            $received = $document->receivedMad();
            $fullyPaid = $received + 0.009 >= (float) $document->indicative_mad_amount;

            $document->forceFill([
                'status' => $fullyPaid ? DocumentStatus::Paid : DocumentStatus::Sent,
                'paid_at' => $fullyPaid ? now() : null,
                'viewed_at' => $document->viewed_at ?? now(),
            ])->save();

            $document->events()->create([
                'user_id' => $actor->id,
                'type' => 'paid',
                'label_fr' => sprintf('Paiement de %s MAD reçus', number_format((float) $data['amount_received_mad'], 2, ',', ' ')),
                'label_ar' => 'تم استلام الدفعة بالدرهم',
                'occurred_at' => now(),
            ]);

            return $payment;
        });
    }
}
