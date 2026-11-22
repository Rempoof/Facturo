<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function edit(Organization $organization): Response
    {
        return Inertia::render('Settings/Index', [
            'organization' => $organization,
            'sequences' => $organization->numberingSequences()->orderBy('document_type')->get(),
            'plans' => config('plans.plans'),
            'subscription' => [
                'plan' => $organization->plan ?? 'essai',
                'trial_ends_at' => $organization->trial_ends_at,
                'usage' => [
                    'documents_this_month' => $organization->documents()->whereMonth('created_at', now()->month)->count(),
                    'clients' => $organization->clients()->count(),
                ],
            ],
        ]);
    }

    public function update(Request $request, Organization $organization): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:180'],
            'ice' => ['nullable', 'string', 'max:20'],
            'auto_entrepreneur_number' => ['nullable', 'string', 'max:40'],
            'identifiant_fiscal' => ['nullable', 'string', 'max:40'],
            'taxe_professionnelle' => ['nullable', 'string', 'max:40'],
            'activity_category' => ['required', Rule::in(['services', 'commercial'])],
            'annual_ceiling_mad' => ['required', 'numeric', 'in:200000,500000'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:120'],
            'email' => ['nullable', 'email'],
            'bank_accounts' => ['array'],
            'bank_accounts.*.key' => ['required', 'string'],
            'bank_accounts.*.currency' => ['required', Rule::in(['MAD', 'EUR', 'CHF', 'USD'])],
            'bank_accounts.*.bank_name' => ['required', 'string'],
            'bank_accounts.*.rib_or_iban' => ['required', 'string'],
            'bank_accounts.*.swift_bic' => ['nullable', 'string'],
            'legal_mentions' => ['array'],
        ]);

        $organization->update($data);

        return back()->with('success', 'Paramètres enregistrés.');
    }
}
