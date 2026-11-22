<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id', 'client_id', 'code', 'name', 'status', 'currency',
        'budget_amount', 'description', 'due_date',
    ];

    protected function casts(): array
    {
        return ['budget_amount' => 'decimal:2', 'due_date' => 'date'];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(ProjectTask::class)->orderBy('position');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    public function unbilledTasks(): HasMany
    {
        return $this->tasks()->whereNotNull('completed_at')->whereNull('billed_document_id');
    }
}
