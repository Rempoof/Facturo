<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Services\CeilingTracker;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, Organization $organization, CeilingTracker $tracker): Response
    {
        return Inertia::render('Dashboard', [
            'today' => $tracker->forOrganization($organization)['today'],
            'dashboard' => $tracker->forOrganization($organization),
            'numberPreviews' => [
                'devis' => $organization->sequenceFor(\App\Enums\DocumentType::Devis, now()->year)->preview(),
                'facture' => $organization->sequenceFor(\App\Enums\DocumentType::Facture, now()->year)->preview(),
            ],
        ]);
    }
}
