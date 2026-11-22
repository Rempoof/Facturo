<?php

namespace App\Providers;

use App\Models\Document;
use App\Models\Organization;
use App\Http\Policies\DocumentPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(Document::class, DocumentPolicy::class);

        Gate::define('manage-billing', fn ($user, Organization $organization) => $user->roleIn($organization) === 'owner');

        Password::defaults(fn () => Password::min(12)->letters()->mixedCase()->numbers()->symbols()->uncompromised());

        RateLimiter::for('documents-issue', fn (Request $request) => Limit::perMinute(30)->by($request->user()?->id));
    }
}
