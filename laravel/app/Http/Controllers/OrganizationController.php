<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\OrganizationInvitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:180'],
            'activity_category' => ['required', 'in:services,commercial'],
        ]);

        $organization = Organization::create([
            'name' => $data['name'],
            'activity_category' => $data['activity_category'],
            'annual_ceiling_mad' => $data['activity_category'] === 'commercial' ? 500000 : 200000,
            'base_currency' => 'MAD',
            'bank_accounts' => [],
            'legal_mentions' => [],
        ]);

        $organization->users()->attach($request->user()->id, ['role' => 'owner']);
        $request->user()->switchOrganization($organization);

        return redirect()->route('dashboard', ['organization' => $organization->slug]);
    }

    public function switch(Request $request, Organization $organization): RedirectResponse
    {
        $request->user()->switchOrganization($organization);

        return redirect()->route('dashboard', ['organization' => $organization->slug]);
    }

    public function invite(Request $request, Organization $organization): RedirectResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'role' => ['required', 'in:admin,member,accountant'],
        ]);

        $invitation = OrganizationInvitation::create([
            'organization_id' => $organization->id,
            'invited_by' => $request->user()->id,
            'email' => $data['email'],
            'role' => $data['role'],
            'token' => Str::random(48),
            'expires_at' => now()->addDays(7),
        ]);

        // Notification is queued so the invitation e-mail never blocks the request.
        $request->user()->notify(new \App\Notifications\OrganizationInvited($invitation));

        return back()->with('success', "Invitation envoyée à {$data['email']}.");
    }
}
