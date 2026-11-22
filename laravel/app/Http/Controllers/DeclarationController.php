<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Services\CeilingTracker;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DeclarationController extends Controller
{
    public function index(Request $request, Organization $organization, CeilingTracker $tracker): Response
    {
        $dashboard = $tracker->forOrganization($organization);

        $quarters = collect([1, 2, 3, 4])->map(function (int $quarter) use ($organization) {
            $start = now()->setMonth(($quarter - 1) * 3 + 1)->startOfMonth();
            $end = (clone $start)->addMonths(3);

            return [
                'quarter' => $quarter,
                'label' => "T{$quarter} ".now()->year,
                'total_mad' => round((float) $organization->payments()
                    ->whereBetween('received_on', [$start->toDateString(), $end->toDateString()])
                    ->sum('amount_received_mad'), 2),
                'deadline' => $end->copy()->endOfMonth()->toDateString(),
            ];
        });

        return Inertia::render('Declarations/Index', [
            'declaration' => $dashboard['declaration'],
            'quarters' => $quarters,
            'ceiling' => $dashboard['ceiling'],
            'activityCategory' => $organization->activity_category,
        ]);
    }
}
