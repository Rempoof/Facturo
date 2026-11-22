<?php

namespace App\Enums;

enum CeilingZone: string
{
    case Safe = 'safe';
    case Vigilance = 'vigilance';
    case Limit = 'limit';

    public static function fromPercent(float $percent): self
    {
        return match (true) {
            $percent < 60 => self::Safe,
            $percent < 85 => self::Vigilance,
            default => self::Limit,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::Safe => 'Sûr',
            self::Vigilance => 'Vigilance',
            self::Limit => 'Limite',
        };
    }

    public function range(): string
    {
        return match ($this) {
            self::Safe => '0–60 %',
            self::Vigilance => '60–85 %',
            self::Limit => '85 % et plus',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Safe => '#34D399',
            self::Vigilance => '#F5B544',
            self::Limit => '#F87171',
        };
    }
}
