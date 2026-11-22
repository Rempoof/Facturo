<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_id', 'position', 'designation', 'unit', 'quantity', 'unit_price',
        'discount_pct', 'line_total',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'unit_price' => 'decimal:2',
            'discount_pct' => 'decimal:2',
            'line_total' => 'decimal:2',
        ];
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }
}
