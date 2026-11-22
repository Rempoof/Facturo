<?php

namespace App\Http\Middleware;

use App\Models\Organization;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Usage limits from config/plans.php (trial, documents per month, clients).
 * Cashier owns the subscription lifecycle; this middleware only guards writes.
 */
class EnforcePlanLimits
{
    public function handle(Request $request, Closure $next, string $limit): Response
    {
        $organization = $request->attributes->get('organization');

        if (! $organization instanceof Organization || $request->isMethod('GET')) {
            return $next($request);
        }

        $plan = $organization->plan ?? 'auto-entrepreneur';
        $limits = config("plans.plans.{$plan}.limits", []);
        $max = $limits[$limit] ?? null;

        if ($max === null) {
            return $next($request);
        }

        $used = match ($limit) {
            'clients' => $organization->clients()->count(),
            'documents_per_month' => $organization->documents()->whereMonth('created_at', now()->month)->count(),
            default => 0,
        };

        abort_if($used >= $max, 402, "Limite du plan atteinte ({$limit}). Passez à un plan supérieur.");
        abort_if($organization->onTrial() === false && $organization->subscribed('default') === false && $plan === 'essai', 402, 'Essai terminé : activez un abonnement.');

        return $next($request);
    }
}
