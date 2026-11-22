<?php

namespace App\Enums;

enum DocumentStatus: string
{
    case Draft = 'draft';
    case Sent = 'sent';
    case Accepted = 'accepted';
    case Pending = 'pending';
    case Paid = 'paid';
    case Overdue = 'overdue';

    public function labelFr(): string
    {
        return match ($this) {
            self::Draft => 'Brouillon',
            self::Sent => 'Envoyée',
            self::Accepted => 'Accepté',
            self::Pending => 'En attente',
            self::Paid => 'Payée',
            self::Overdue => 'En retard',
        };
    }

    /** Design tokens from docs/design/DESIGN_SPEC.md */
    public function colors(): array
    {
        return match ($this) {
            self::Paid => ['bg' => '#DDF5E6', 'fg' => '#0B6B3A'],
            self::Sent => ['bg' => '#E4EBFF', 'fg' => '#1B45C9'],
            self::Accepted => ['bg' => '#DDF5E6', 'fg' => '#0B6B3A'],
            self::Pending => ['bg' => '#FFF0D6', 'fg' => '#8A4B00'],
            self::Overdue => ['bg' => '#FDE3E3', 'fg' => '#A31D1D'],
            self::Draft => ['bg' => '#E8EAEE', 'fg' => '#3F4654'],
        };
    }
}
