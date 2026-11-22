<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $organization = $request->attributes->get('organization') ?? $user?->currentOrganization;

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user?->only('id', 'name', 'email', 'two_factor_confirmed_at'),
                'organizations' => $user?->organizations()->get(['organizations.id', 'name', 'slug']) ?? [],
            ],
            'organization' => $organization?->only([
                'id', 'name', 'slug', 'base_currency', 'activity_category', 'annual_ceiling_mad',
                'ice', 'auto_entrepreneur_number', 'email',
            ]),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'locale' => $user?->locale ?? 'fr',
        ];
    }
}
