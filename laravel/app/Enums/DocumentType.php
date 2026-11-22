<?php

namespace App\Enums;

enum DocumentType: string
{
    case Devis = 'devis';
    case Proforma = 'proforma';
    case Facture = 'facture';
    case Acompte = 'acompte';
    case Avoir = 'avoir';

    public function prefix(): string
    {
        return match ($this) {
            self::Devis => 'DEV',
            self::Proforma => 'PRO',
            self::Facture => 'FAC',
            self::Acompte => 'ACO',
            self::Avoir => 'AVO',
        };
    }

    /** @return array<string, string> */
    public function titles(): array
    {
        return match ($this) {
            self::Devis => ['fr' => 'DEVIS', 'en' => 'QUOTE', 'ar' => 'عرض أثمان'],
            self::Proforma => ['fr' => 'FACTURE PROFORMA', 'en' => 'PROFORMA INVOICE', 'ar' => 'فاتورة أولية (بروفورما)'],
            self::Facture => ['fr' => 'FACTURE', 'en' => 'INVOICE', 'ar' => 'فاتورة'],
            self::Acompte => ['fr' => "FACTURE D'ACOMPTE", 'en' => 'DEPOSIT INVOICE', 'ar' => 'فاتورة تسبيق'],
            self::Avoir => ['fr' => "FACTURE D'AVOIR", 'en' => 'CREDIT NOTE', 'ar' => 'إشعار دائن'],
        };
    }

    public function isQuote(): bool
    {
        return in_array($this, [self::Devis, self::Proforma], true);
    }

    public function isInvoice(): bool
    {
        return in_array($this, [self::Facture, self::Acompte], true);
    }
}
