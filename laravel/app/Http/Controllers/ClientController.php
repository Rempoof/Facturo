<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClientRequest;
use App\Models\Client;
use App\Models\Organization;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    public function index(Request $request, Organization $organization): Response
    {
        $clients = $organization->clients()
            ->withCount('documents')
            ->when($request->string('search')->toString(), fn ($q, $search) => $q->where(function ($inner) use ($search) {
                $inner->where('name', 'ilike', "%{$search}%")
                    ->orWhere('city', 'ilike', "%{$search}%")
                    ->orWhere('tax_id', 'ilike', "%{$search}%");
            }))
            ->orderBy('name')
            ->get();

        $selected = $request->integer('client_id')
            ? $clients->firstWhere('id', $request->integer('client_id'))
            : $clients->first();

        return Inertia::render('Clients/Index', [
            'clients' => $clients,
            'selected' => $selected?->load(['documents' => fn ($q) => $q->latest('issue_date')->limit(10)]),
            'filters' => $request->only('search'),
        ]);
    }

    public function store(StoreClientRequest $request, Organization $organization): RedirectResponse
    {
        $data = $request->validated();
        $data['tax_id_label'] = match ($data['country_code']) {
            'MA' => 'ICE',
            'FR' => 'TVA Intracom.',
            'CH' => 'IDE / UID',
            'US' => 'EIN',
            default => 'Tax ID',
        };

        $client = $organization->clients()->create($data);

        return redirect()
            ->route('clients.index', ['organization' => $organization->slug, 'client_id' => $client->id])
            ->with('success', 'Client ajouté.');
    }

    public function update(StoreClientRequest $request, Organization $organization, Client $client): RedirectResponse
    {
        abort_unless($client->organization_id === $organization->id, 404);
        $client->update($request->validated());

        return back()->with('success', 'Client mis à jour.');
    }
}
