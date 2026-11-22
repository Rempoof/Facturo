<?php

namespace App\Enums;

enum Currency: string
{
    case MAD = 'MAD';
    case EUR = 'EUR';
    case CHF = 'CHF';
    case USD = 'USD';

    /** Indicative conversion used until a real bank rate is recorded. */
    public function defaultRateToMad(): float
    {
        return match ($this) {
            self::MAD => 1.0,
            self::EUR => 10.80,
            self::CHF => 11.35,
            self::USD => 9.95,
        };
    }

    public function flag(): string
    {
        return match ($this) {
            self::MAD => 'MA',
            self::EUR => 'EU',
            self::CHF => 'CH',
            self::USD => 'US',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::MAD => 'MAD — Dirham marocain',
            self::EUR => 'EUR — Euro (Zone SEPA)',
            self::CHF => 'CHF — Franc suisse',
            self::USD => 'USD — Dollar américain',
        };
    }
}
