<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NumberingSequence extends Model
{
    protected $fillable = [
        'organization_id', 'document_type', 'year', 'prefix', 'padding', 'next_number',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function preview(): string
    {
        return sprintf('%s-%d-%s', $this->prefix, $this->year, str_pad((string) $this->next_number, $this->padding, '0', STR_PAD_LEFT));
    }
}
