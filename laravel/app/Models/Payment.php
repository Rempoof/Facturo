<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id', 'document_id', 'recorded_by', 'amount', 'currency',
        'exchange_rate_to_mad', 'amount_received_mad', 'bank_fees_mad', 'received_on',
        'method', 'reference', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'exchange_rate_to_mad' => 'decimal:4',
            'amount_received_mad' => 'decimal:2',
            'bank_fees_mad' => 'decimal:2',
            'received_on' => 'date',
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }
}
