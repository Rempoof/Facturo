<?php

namespace App\Http\Requests;

use App\Enums\Currency;
use App\Enums\DocumentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->belongsToOrganization((int) $this->route('organization')->id);
    }

    public function rules(): array
    {
        $values = fn (array $cases) => array_map(fn ($c) => $c->value, $cases);

        return [
            'type' => ['required', Rule::in($values(DocumentType::cases()))],
            'client_id' => ['required', Rule::exists('clients', 'id')->where('organization_id', $this->route('organization')->id)],
            'project_id' => ['nullable', Rule::exists('projects', 'id')->where('organization_id', $this->route('organization')->id)],
            'language' => ['required', Rule::in(['FR', 'EN', 'AR'])],
            'currency' => ['required', Rule::in($values(Currency::cases()))],
            'exchange_rate_to_mad' => ['nullable', 'numeric', 'gt:0'],
            'issue_date' => ['required', 'date'],
            'due_date' => ['required', 'date', 'after_or_equal:issue_date'],
            'vat_regime' => ['required', Rule::in(['franchise_ae', 'export_hors_champ'])],
            'payment_method' => ['required', 'string', 'max:120'],
            'payment_terms' => ['required', 'string', 'max:120'],
            'bank_account_key' => ['nullable', 'string', 'max:60'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'legal_mention' => ['nullable', 'string', 'max:2000'],
            'global_discount_pct' => ['nullable', 'numeric', 'min:0', 'max:90'],
            'deposit_requested_pct' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'issue_now' => ['boolean'],

            'lines' => ['required', 'array', 'min:1'],
            'lines.*.designation' => ['required', 'string', 'max:255'],
            'lines.*.unit' => ['required', Rule::in(['jour', 'heure', 'forfait', 'unité'])],
            'lines.*.quantity' => ['required', 'numeric', 'gt:0'],
            'lines.*.unit_price' => ['required', 'numeric', 'gt:0'],
            'lines.*.discount_pct' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'lines.*.unit_price.gt' => 'Le prix unitaire doit être supérieur à 0.',
            'lines.*.quantity.gt' => 'La quantité doit être supérieure à 0.',
            'due_date.after_or_equal' => "L'échéance ne peut pas être antérieure à la date d'émission.",
        ];
    }
}
