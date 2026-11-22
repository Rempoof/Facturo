<?php

namespace App\Http\Middleware;

use App\Models\Organization;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\Response;

class EnsureOrganizationContext
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $organization = $request->route('organization');

        if (! $organization instanceof Organization) {
            $organization = $user?->currentOrganization;

            if ($organization === null && $user !== null) {
                $organization = $user->organizations()->first();
                $user->forceFill(['current_organization_id' => $organization?->id])->save();
            }

            abort_if($organization === null, 403, 'Aucune organisation associée à ce compte.');

            return redirect()->route($request->route()->getName(), [
                'organization' => $organization->slug,
                ...$request->query(),
            ]);
        }

        abort_unless($user !== null && $user->belongsToOrganization($organization->id), 403);

        URL::defaults(['organization' => $organization->slug]);
        $request->attributes->set('organization', $organization);
        app()->instance(Organization::class, $organization);

        return $next($request);
    }
}
