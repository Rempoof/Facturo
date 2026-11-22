<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id', 'title', 'unit', 'quantity', 'unit_price', 'completed_at',
        'billed_document_id', 'position',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'unit_price' => 'decimal:2',
            'completed_at' => 'datetime',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function billedDocument(): BelongsTo
    {
        return $this->belongsTo(Document::class, 'billed_document_id');
    }

    public function total(): float
    {
        return round((float) $this->quantity * (float) $this->unit_price, 2);
    }
}
