<?php

/**
 * Subscription engine: plans, trials and usage limits.
 * Cashier handles the billing lifecycle; these limits are enforced by
 * App\Http\Middleware\EnforcePlanLimits and shown on Settings.
 */
return [
    'trial_days' => 14,

    'plans' => [
        'essai' => [
            'label' => 'Essai',
            'price_mad' => 0,
            'limits' => ['documents_per_month' => 5, 'clients' => 3, 'members' => 1, 'pdf_watermark' => true],
        ],
        'auto-entrepreneur' => [
            'label' => 'Auto-Entrepreneur',
            'price_mad' => 99,
            'limits' => ['documents_per_month' => 100, 'clients' => 50, 'members' => 1, 'pdf_watermark' => false],
            'price_id' => env('STRIPE_PRICE_AE'),
        ],
        'cabinet' => [
            'label' => 'Cabinet',
            'price_mad' => 299,
            'limits' => ['documents_per_month' => null, 'clients' => null, 'members' => 5, 'pdf_watermark' => false],
            'price_id' => env('STRIPE_PRICE_CABINET'),
        ],
    ],
];
