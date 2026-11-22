<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentEvent extends Model
{
    protected $fillable = ['document_id', 'user_id', 'type', 'label_fr', 'label_ar', 'meta', 'occurred_at'];

    protected function casts(): array
    {
        return ['meta' => 'array', 'occurred_at' => 'datetime'];
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
