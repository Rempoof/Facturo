<?php

namespace App\Models;

use App\Enums\Currency;
use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id', 'client_id', 'project_id', 'created_by', 'type', 'status',
        'is_locked', 'number', 'number_year', 'sequence_number', 'language', 'currency',
        'exchange_rate_to_mad', 'issue_date', 'due_date', 'subtotal', 'discount_amount',
        'global_discount_pct', 'deposit_requested_pct', 'total_amount',
        'indicative_mad_amount', 'vat_regime', 'legal_mention', 'payment_method',
        'payment_terms', 'bank_account_key', 'notes', 'issued_at', 'locked_at',
        'sent_at', 'viewed_at', 'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'is_locked' => 'boolean',
            'type' => DocumentType::class,
            'currency' => Currency::class,
            'status' => DocumentStatus::class,
            'issue_date' => 'date',
            'due_date' => 'date',
            'exchange_rate_to_mad' => 'decimal:4',
            'subtotal' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'indicative_mad_amount' => 'decimal:2',
            'global_discount_pct' => 'decimal:2',
            'deposit_requested_pct' => 'decimal:2',
            'issued_at' => 'datetime',
            'locked_at' => 'datetime',
            'sent_at' => 'datetime',
            'viewed_at' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function lines(): HasMany
    {
        return $this->hasMany(DocumentLine::class)->orderBy('position');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class)->latest('received_on');
    }

    public function events(): HasMany
    {
        return $this->hasMany(DocumentEvent::class)->latest('occurred_at');
    }

    public function scopeForOrganization(Builder $query, int $organizationId): Builder
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeIssued(Builder $query): Builder
    {
        return $query->where('is_locked', true);
    }

    public function scopeInvoices(Builder $query): Builder
    {
        return $query->whereIn('type', [DocumentType::Facture->value, DocumentType::Acompte->value]);
    }

    public function isDraft(): bool
    {
        return ! $this->is_locked;
    }

    public function canBeEdited(): bool
    {
        return ! $this->is_locked;
    }

    public function receivedMad(): float
    {
        return round((float) $this->payments()->sum('amount_received_mad'), 2);
    }

    public function remainingMad(): float
    {
        return max(0, round((float) $this->indicative_mad_amount - $this->receivedMad(), 2));
    }

    public function displayNumber(): string
    {
        return $this->number ?? 'Attribué à l’émission';
    }
}
