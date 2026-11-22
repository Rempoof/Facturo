<?php

namespace App\Http\Controllers;

use App\Http\Requests\RecordPaymentRequest;
use App\Models\Document;
use App\Models\Organization;
use App\Services\PaymentRecorder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(Request $request, Organization $organization): Response
    {
        $payments = $organization->payments()
            ->with(['document:id,number,client_id,currency', 'document.client:id,name,country_code'])
            ->when($request->string('currency')->toString(), fn ($q, $currency) => $q->where('currency', $currency))
            ->latest('received_on')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Payments/Index', [
            'payments' => $payments,
            'totals' => [
                'received_mad' => round((float) $organization->payments()->sum('amount_received_mad'), 2),
                'fees_mad' => round((float) $organization->payments()->sum('bank_fees_mad'), 2),
            ],
            'filters' => $request->only('currency'),
        ]);
    }

    public function store(RecordPaymentRequest $request, Organization $organization, Document $document, PaymentRecorder $recorder): RedirectResponse
    {
        abort_unless($document->organization_id === $organization->id, 404);
        $this->authorize('recordPayment', $document);

        $recorder->record($document, $request->validated(), $request->user());

        return back()->with('success', 'Paiement enregistré : le montant reçu en MAD a été ajouté au plafond.');
    }
}
