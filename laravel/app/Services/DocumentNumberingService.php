<?php

namespace App\Services;

use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use App\Models\Document;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Locked sequential numbering.
 *
 * - A draft never consumes a number ("Attribué à l'émission").
 * - Issuing takes a row lock on numbering_sequences and assigns the next number
 *   inside the same transaction as the lock flag, so concurrent requests can
 *   never produce duplicates or gaps.
 * - An issued document can never be edited or deleted; corrections require an
 *   avoir.
 */
class DocumentNumberingService
{
    public function nextPreview(Organization $organization, DocumentType $type, int $year): string
    {
        $sequence = $organization->sequenceFor($type, $year);

        return $sequence->preview();
    }

    public function issue(Document $document, User $actor): Document
    {
        if ($document->is_locked) {
            throw ValidationException::withMessages([
                'number' => 'Ce document est déjà émis et verrouillé. Créez un avoir pour le corriger.',
            ]);
        }

        return DB::transaction(function () use ($document, $actor) {
            $year = (int) $document->issue_date->year;

            /** @var \App\Models\NumberingSequence $sequence */
            $sequence = $document->organization
                ->numberingSequences()
                ->where('document_type', $document->type->value)
                ->where('year', $year)
                ->lockForUpdate()
                ->first();

            if ($sequence === null) {
                $sequence = $document->organization->sequenceFor($document->type, $year);
                $sequence = $document->organization->numberingSequences()
                    ->whereKey($sequence->id)
                    ->lockForUpdate()
                    ->firstOrFail();
            }

            $number = sprintf(
                '%s-%d-%s',
                $sequence->prefix,
                $sequence->year,
                str_pad((string) $sequence->next_number, $sequence->padding, '0', STR_PAD_LEFT),
            );

            $sequence->increment('next_number');

            $document->forceFill([
                'number' => $number,
                'number_year' => $sequence->year,
                'sequence_number' => $sequence->next_number - 1,
                'is_locked' => true,
                'status' => $document->type->isQuote() ? DocumentStatus::Pending : DocumentStatus::Sent,
                'issued_at' => now(),
                'locked_at' => now(),
                'sent_at' => now(),
            ])->save();

            $document->events()->create([
                'user_id' => $actor->id,
                'type' => 'issued',
                'label_fr' => "Émis et verrouillé ({$number})",
                'label_ar' => "صدر ومقفل ({$number})",
                'occurred_at' => now(),
            ]);

            return $document->refresh();
        });
    }

    public function assertEditable(Document $document): void
    {
        if (! $document->canBeEdited()) {
            throw ValidationException::withMessages([
                'document' => 'Document verrouillé : émettez un avoir pour toute correction.',
            ]);
        }
    }
}
