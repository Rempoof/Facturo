<?php

namespace App\Services;

use App\Enums\Currency;
use App\Enums\DocumentType;

/**
 * Single source of truth for document amounts. Everything is rounded to 2
 * decimals (MAD/EUR/CHF/USD) and conversion to MAD stays indicative.
 */
class DocumentCalculator
{
    /**
     * @param  array<int, array{quantity: numeric, unit_price: numeric, discount_pct?: numeric}>  $lines
     * @return array{subtotal: float, discount_amount: float, total: float, indicative_mad: float}
     */
    public function totals(
        array $lines,
        float $globalDiscountPct = 0,
        float $depositPct = 0,
        DocumentType $type = DocumentType::Facture,
        Currency $currency = Currency::MAD,
        float $rateToMad = 1,
        bool $withDeposit = false,
    ): array {
        $subtotal = 0.0;

        foreach ($lines as $line) {
            $gross = (float) $line['quantity'] * (float) $line['unit_price'];
            $subtotal += $gross * (1 - ((float) ($line['discount_pct'] ?? 0) / 100));
        }

        $subtotal = round($subtotal, 2);
        $discount = round($subtotal * ($globalDiscountPct / 100), 2);
        $net = max(0, round($subtotal - $discount, 2));

        if ($withDeposit && $depositPct > 0) {
            $net = round($net * ($depositPct / 100), 2);
        }

        if ($type === DocumentType::Avoir) {
            $net *= -1;
        }

        $rate = $currency === Currency::MAD ? 1 : ($rateToMad > 0 ? $rateToMad : $currency->defaultRateToMad());

        return [
            'subtotal' => $subtotal,
            'discount_amount' => $discount,
            'total' => round($net, 2),
            'indicative_mad' => round($net * $rate, 2),
        ];
    }
}
