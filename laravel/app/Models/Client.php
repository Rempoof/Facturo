<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id', 'name', 'contact_name', 'type', 'country_code', 'city',
        'address', 'email', 'tax_id', 'tax_id_label', 'preferred_language',
        'default_currency', 'notes',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    public function isMoroccan(): bool
    {
        return $this->country_code === 'MA';
    }

    public function taxIdLabel(): string
    {
        return match ($this->country_code) {
            'MA' => 'ICE',
            'FR' => 'TVA Intracom.',
            'CH' => 'IDE / UID',
            'US' => 'EIN',
            default => $this->tax_id_label ?: 'Tax ID',
        };
    }
}
