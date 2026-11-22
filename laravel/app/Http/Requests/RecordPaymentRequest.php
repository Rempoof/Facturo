<?php

namespace App\Http\Requests;

use App\Enums\Currency;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RecordPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->belongsToOrganization((int) $this->route('organization')->id);
    }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'gt:0'],
            'currency' => ['required', Rule::in(array_map(fn ($c) => $c->value, Currency::cases()))],
            'exchange_rate_to_mad' => ['nullable', 'numeric', 'gt:0'],
            'amount_received_mad' => ['required', 'numeric', 'gt:0'],
            'bank_fees_mad' => ['nullable', 'numeric', 'min:0'],
            'received_on' => ['required', 'date', 'before_or_equal:today'],
            'method' => ['required', 'string', 'max:120'],
            'reference' => ['nullable', 'string', 'max:80'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'amount_received_mad.required' => 'Indiquez le montant net crédité en MAD : il est obligatoire.',
            'amount_received_mad.gt' => 'Le montant reçu en MAD doit être supérieur à 0.',
        ];
    }
}
