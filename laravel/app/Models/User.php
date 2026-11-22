<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Cashier\Billable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    use Billable;
    use HasFactory;
    use HasRoles;
    use Notifiable;
    use TwoFactorAuthenticatable;

    protected $fillable = [
        'name', 'email', 'password', 'current_organization_id', 'locale',
        'two_factor_secret', 'two_factor_recovery_codes', 'two_factor_confirmed_at',
    ];

    protected $hidden = [
        'password', 'remember_token', 'two_factor_secret', 'two_factor_recovery_codes',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function currentOrganization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'current_organization_id');
    }

    public function organizations(): BelongsToMany
    {
        return $this->belongsToMany(Organization::class)->withPivot('role')->withTimestamps();
    }

    public function roleIn(Organization $organization): ?string
    {
        return $this->organizations()->whereKey($organization->id)->first()?->pivot?->role;
    }

    public function belongsToOrganization(int $organizationId): bool
    {
        return $this->organizations()->whereKey($organizationId)->exists();
    }

    public function switchOrganization(Organization $organization): void
    {
        abort_unless($this->belongsToOrganization($organization->id), 403);

        $this->forceFill(['current_organization_id' => $organization->id])->save();
    }
}
