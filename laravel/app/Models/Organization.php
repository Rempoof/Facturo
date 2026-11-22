<?php

namespace App\Models;

use App\Enums\DocumentType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Organization extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'country_code', 'base_currency', 'activity_category', 'ice',
        'auto_entrepreneur_number', 'identifiant_fiscal', 'taxe_professionnelle',
        'address', 'city', 'email', 'phone', 'annual_ceiling_mad', 'bank_accounts',
        'legal_mentions', 'logo_path', 'signature_path',
    ];

    protected function casts(): array
    {
        return [
            'bank_accounts' => 'array',
            'legal_mentions' => 'array',
            'annual_ceiling_mad' => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $organization) {
            $organization->slug ??= Str::slug($organization->name).'-'.Str::lower(Str::random(6));
        });
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withPivot('role')->withTimestamps();
    }

    public function clients(): HasMany
    {
        return $this->hasMany(Client::class);
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function numberingSequences(): HasMany
    {
        return $this->hasMany(NumberingSequence::class);
    }

    public function bankAccountFor(string $currency): ?array
    {
        $accounts = collect($this->bank_accounts ?? []);

        return $accounts->firstWhere('currency', $currency) ?? $accounts->first();
    }

    public function legalMentionFor(string $regime, string $language): string
    {
        $key = $regime === 'export_hors_champ' ? 'export' : 'ma';

        return $this->legal_mentions[$key.strtoupper($language)] ?? '';
    }

    public function sequenceFor(DocumentType $type, int $year): NumberingSequence
    {
        return NumberingSequence::firstOrCreate(
            ['organization_id' => $this->id, 'document_type' => $type->value, 'year' => $year],
            ['prefix' => $type->prefix(), 'padding' => 4, 'next_number' => 1],
        );
    }
}
