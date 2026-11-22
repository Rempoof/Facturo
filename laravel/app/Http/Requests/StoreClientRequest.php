<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->belongsToOrganization((int) $this->route('organization')->id);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:180'],
            'contact_name' => ['nullable', 'string', 'max:120'],
            'type' => ['required', Rule::in(['company_ma', 'company_intl', 'individual'])],
            'country_code' => ['required', 'string', 'size:2'],
            'city' => ['nullable', 'string', 'max:120'],
            'address' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:180'],
            'tax_id' => ['nullable', 'string', 'max:40'],
            'preferred_language' => ['required', Rule::in(['FR', 'EN', 'AR'])],
            'default_currency' => ['required', Rule::in(['MAD', 'EUR', 'CHF', 'USD'])],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->sometimes('tax_id', 'regex:/^\d{15}$/', function ($input) {
            return $input->country_code === 'MA' && filled($input->tax_id);
        })->after(function ($validator) {
            if ($this->country_code === 'MA' && filled($this->tax_id) && ! preg_match('/^\d{15}$/', (string) $this->tax_id)) {
                $validator->errors()->add('tax_id', "L'ICE marocain doit comporter exactement 15 chiffres.");
            }
        });
    }
}
