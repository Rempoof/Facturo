<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id', 'code', 'title_fr', 'title_en', 'title_ar', 'description',
        'unit', 'unit_price_mad', 'category',
    ];

    protected function casts(): array
    {
        return ['unit_price_mad' => 'decimal:2'];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function titleFor(string $language): string
    {
        return match (strtoupper($language)) {
            'AR' => $this->title_ar,
            'EN' => $this->title_en,
            default => $this->title_fr,
        };
    }
}
