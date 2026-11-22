<?php

namespace Database\Seeders;

use App\Enums\Currency;
use App\Enums\DocumentType;
use App\Models\Document;
use App\Models\Organization;
use App\Models\User;
use App\Services\DocumentCalculator;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Demo data for the Facturo dashboard. All names, amounts and identifiers are
 * fictional sample values ("Données d'exemple").
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $organization = Organization::create([
            'name' => 'Atelier Zellige Numérique (Exemple)',
            'country_code' => 'MA',
            'base_currency' => 'MAD',
            'activity_category' => 'services',
            'ice' => '000000000000099',
            'auto_entrepreneur_number' => 'AE-2026-009841',
            'identifiant_fiscal' => 'IF-50991234',
            'taxe_professionnelle' => 'TP-34900112',
            'address' => "48 Bd d'Anfa, Quartier Gautier",
            'city' => 'Casablanca 20060',
            'email' => 'youssef.sample@atelier-exemple.ma',
            'phone' => '+212 6 00 00 00 99',
            'annual_ceiling_mad' => 200000,
            'bank_accounts' => [
                ['key' => 'mad_rib', 'currency' => 'MAD', 'bank_name' => 'Banque Atlantique Maroc (Exemple)', 'rib_or_iban' => '230 780 0000123456789000 44', 'swift_bic' => 'BAMMAMCXXXX'],
                ['key' => 'eur_iban', 'currency' => 'EUR', 'bank_name' => 'Compte Devises Export EUR', 'rib_or_iban' => 'MA64 2307 8000 0098 7654 3210 0088', 'swift_bic' => 'BAMMAMCXXXX'],
                ['key' => 'chf_iban', 'currency' => 'CHF', 'bank_name' => 'Correspondant International CHF', 'rib_or_iban' => 'CH93 0000 0000 1234 5678 9', 'swift_bic' => 'POFICHBEXXX'],
                ['key' => 'usd_iban', 'currency' => 'USD', 'bank_name' => 'Compte Devises Export USD', 'rib_or_iban' => 'MA64 2307 8000 0055 4433 2211 0019', 'swift_bic' => 'BAMMAMCXXXX'],
            ],
            'legal_mentions' => [
                'maFR' => "TVA non applicable — Régime de l'Auto-Entrepreneur (Article 89-I-12° du CGI).",
                'exportFR' => 'Prestation de services à l’export exonérée de TVA marocaine (Article 92-I-1° du CGI).',
                'maEN' => 'VAT not applicable — Moroccan Auto-Entrepreneur regime (Article 89-I-12°).',
                'exportEN' => 'Export of digital services exempt from Moroccan VAT (Article 92-I-1°).',
                'maAR' => 'غير خاضع للضريبة على القيمة المضافة — نظام المقاول الذاتي.',
                'exportAR' => 'تصدير خدمات رقمية معفى من الضريبة على القيمة المضافة.',
            ],
        ]);

        $user = User::create([
            'name' => 'Youssef El Amrani (Exemple)',
            'email' => 'youssef.sample@atelier-exemple.ma',
            'password' => Hash::make('Password!2026'),
            'email_verified_at' => now(),
            'current_organization_id' => $organization->id,
        ]);
        $organization->users()->attach($user->id, ['role' => 'owner']);
        $user->assignRole('owner');

        foreach (['devis' => 'DEV', 'proforma' => 'PRO', 'facture' => 'FAC', 'acompte' => 'ACO', 'avoir' => 'AVO'] as $type => $prefix) {
            $organization->numberingSequences()->create([
                'document_type' => $type, 'year' => (int) now()->year, 'prefix' => $prefix, 'padding' => 4, 'next_number' => 1,
            ]);
        }

        $clients = collect([
            ['name' => 'Koutoubia Logistique SARL (Exemple)', 'country_code' => 'MA', 'city' => 'Casablanca', 'tax_id' => '001599000012388', 'default_currency' => 'MAD', 'preferred_language' => 'FR'],
            ['name' => 'Maison Lumière Digital SAS (Exemple)', 'country_code' => 'FR', 'city' => 'Paris', 'tax_id' => 'FR44899000112', 'default_currency' => 'EUR', 'preferred_language' => 'FR'],
            ['name' => 'Helvetia Horlogerie Lab Sàrl (Exemple)', 'country_code' => 'CH', 'city' => 'Genève', 'tax_id' => 'CHE-119.000.882', 'default_currency' => 'CHF', 'preferred_language' => 'FR'],
            ['name' => 'Northstar Cloud Systems Inc. (Exemple)', 'country_code' => 'US', 'city' => 'Austin', 'tax_id' => 'EIN 98-0004129', 'default_currency' => 'USD', 'preferred_language' => 'EN'],
            ['name' => 'شركة الأطلس للابتكار (نموذج)', 'country_code' => 'MA', 'city' => 'الرباط', 'tax_id' => '002881000045601', 'default_currency' => 'MAD', 'preferred_language' => 'AR'],
        ])->map(fn (array $data) => $organization->clients()->create([
            ...$data,
            'type' => $data['country_code'] === 'MA' ? 'company_ma' : 'company_intl',
            'contact_name' => 'Contact (Exemple)',
            'address' => "{$data['city']} (Exemple)",
            'email' => 'contact@client-exemple.ma',
            'tax_id_label' => match ($data['country_code']) { 'MA' => 'ICE', 'FR' => 'TVA Intracom.', 'CH' => 'IDE / UID', 'US' => 'EIN' },
            'notes' => 'Données fictives d’illustration (Exemple).',
        ]));

        $services = collect([
            ['code' => 'SRV-UX-01', 'title_fr' => 'Audit UX & Architecture d’interface', 'title_en' => 'Product UX Audit', 'title_ar' => 'تدقيق تجربة المستخدم', 'unit_price_mad' => 4200, 'unit' => 'jour'],
            ['code' => 'SRV-DS-02', 'title_fr' => 'Conception Design System & Composants UI', 'title_en' => 'Design System & UI Library', 'title_ar' => 'تصميم نظام الهوية البصرية', 'unit_price_mad' => 16500, 'unit' => 'forfait'],
            ['code' => 'SRV-FE-03', 'title_fr' => 'Intégration Front-end & Prototypage', 'title_en' => 'Front-end & Prototyping', 'title_ar' => 'تطوير الواجهات الأمامية', 'unit_price_mad' => 4500, 'unit' => 'jour'],
        ])->map(fn ($s) => $organization->services()->create([...$s, 'description' => 'Prestation réutilisable (Exemple).', 'category' => 'Design Produit']));

        $project = $organization->projects()->create([
            'client_id' => $clients[1]->id, 'code' => 'PRJ-2026-01', 'name' => 'Refonte Portail Client B2B (Exemple)',
            'status' => 'active', 'currency' => 'EUR', 'budget_amount' => 5400,
            'description' => 'Refonte de l’espace client et design system bilingue (Exemple).',
            'due_date' => now()->addMonth()->toDateString(),
        ]);

        $project->tasks()->createMany([
            ['title' => 'Audit parcours client & architecture (Exemple)', 'unit' => 'jour', 'quantity' => 3, 'unit_price' => 550, 'completed_at' => now()->subDays(10), 'position' => 1],
            ['title' => 'Bibliothèque de composants UI AA (Exemple)', 'unit' => 'forfait', 'quantity' => 1, 'unit_price' => 2200, 'completed_at' => now()->subDays(4), 'position' => 2],
            ['title' => 'Maquettes haute fidélité Desktop & Mobile', 'unit' => 'jour', 'quantity' => 3, 'unit_price' => 550, 'position' => 3],
        ]);

        $calculator = app(DocumentCalculator::class);

        $makeDocument = function (array $data, array $lines) use ($organization, $user, $calculator) {
            $type = DocumentType::from($data['type']);
            $currency = Currency::from($data['currency']);
            $totals = $calculator->totals($lines, $data['global_discount_pct'] ?? 0, $data['deposit_requested_pct'] ?? 0, $type, $currency, $data['exchange_rate_to_mad'] ?? $currency->defaultRateToMad());

            $document = $organization->documents()->create([
                ...$data,
                'created_by' => $user->id,
                'subtotal' => $totals['subtotal'],
                'discount_amount' => $totals['discount_amount'],
                'total_amount' => $totals['total'],
                'indicative_mad_amount' => $totals['indicative_mad'],
                'is_locked' => true,
            ]);

            foreach ($lines as $index => $line) {
                $document->lines()->create([
                    ...$line, 'position' => $index,
                    'line_total' => round($line['quantity'] * $line['unit_price'] * (1 - (($line['discount_pct'] ?? 0) / 100)), 2),
                ]);
            }

            return $document;
        };

        $paidInvoice = $makeDocument([
            'client_id' => $clients[0]->id, 'type' => 'facture', 'status' => 'paid', 'number' => 'FAC-2026-0001',
            'number_year' => now()->year, 'sequence_number' => 1, 'language' => 'FR', 'currency' => 'MAD',
            'exchange_rate_to_mad' => 1, 'issue_date' => now()->subMonths(5)->toDateString(), 'due_date' => now()->subMonths(4)->toDateString(),
            'vat_regime' => 'franchise_ae', 'legal_mention' => $organization->legal_mentions['maFR'],
            'payment_method' => 'Virement RIB Maroc', 'payment_terms' => '30 jours nets', 'bank_account_key' => 'mad_rib',
            'issued_at' => now()->subMonths(5), 'locked_at' => now()->subMonths(5), 'paid_at' => now()->subMonths(5)->addDays(12),
        ], [
            ['designation' => 'Atelier cadrage métier (Exemple)', 'unit' => 'jour', 'quantity' => 2, 'unit_price' => 4000, 'discount_pct' => 0],
            ['designation' => 'Maquettes écrans dispatch (Exemple)', 'unit' => 'forfait', 'quantity' => 1, 'unit_price' => 36000, 'discount_pct' => 0],
        ]);

        $overdueInvoice = $makeDocument([
            'client_id' => $clients[0]->id, 'type' => 'facture', 'status' => 'overdue', 'number' => 'FAC-2026-0002',
            'number_year' => now()->year, 'sequence_number' => 2, 'language' => 'FR', 'currency' => 'MAD',
            'exchange_rate_to_mad' => 1, 'issue_date' => now()->subDays(40)->toDateString(), 'due_date' => now()->subDays(10)->toDateString(),
            'vat_regime' => 'franchise_ae', 'legal_mention' => $organization->legal_mentions['maFR'],
            'payment_method' => 'Virement RIB Maroc', 'payment_terms' => '30 jours nets', 'bank_account_key' => 'mad_rib',
            'issued_at' => now()->subDays(40), 'locked_at' => now()->subDays(40),
        ], [
            ['designation' => 'Maintenance évolutive composants UI (Exemple)', 'unit' => 'jour', 'quantity' => 3, 'unit_price' => 4200, 'discount_pct' => 0],
        ]);

        $sentInvoice = $makeDocument([
            'client_id' => $clients[1]->id, 'type' => 'facture', 'status' => 'sent', 'number' => 'FAC-2026-0003',
            'number_year' => now()->year, 'sequence_number' => 3, 'language' => 'FR', 'currency' => 'EUR',
            'exchange_rate_to_mad' => 10.80, 'issue_date' => now()->toDateString(), 'due_date' => now()->addDays(29)->toDateString(),
            'vat_regime' => 'export_hors_champ', 'legal_mention' => $organization->legal_mentions['exportFR'],
            'payment_method' => 'Virement SEPA / SWIFT', 'payment_terms' => '30 jours nets', 'bank_account_key' => 'eur_iban',
            'project_id' => $project->id, 'issued_at' => now(), 'locked_at' => now(), 'sent_at' => now(),
        ], [
            ['designation' => 'Design System & tokens UI (Exemple)', 'unit' => 'forfait', 'quantity' => 1, 'unit_price' => 2200, 'discount_pct' => 0],
            ['designation' => 'Maquettes Desktop & Mobile (Exemple)', 'unit' => 'jour', 'quantity' => 4, 'unit_price' => 550, 'discount_pct' => 5],
        ]);

        $acceptedQuote = $makeDocument([
            'client_id' => $clients[1]->id, 'type' => 'devis', 'status' => 'accepted', 'number' => 'DEV-2026-0001',
            'number_year' => now()->year, 'sequence_number' => 1, 'language' => 'FR', 'currency' => 'EUR',
            'exchange_rate_to_mad' => 10.80, 'issue_date' => now()->subDays(20)->toDateString(), 'due_date' => now()->addDays(10)->toDateString(),
            'vat_regime' => 'export_hors_champ', 'legal_mention' => $organization->legal_mentions['exportFR'],
            'payment_method' => 'Virement SEPA / SWIFT', 'payment_terms' => 'À réception', 'bank_account_key' => 'eur_iban',
            'issued_at' => now()->subDays(20), 'locked_at' => now()->subDays(20), 'sent_at' => now()->subDays(20),
        ], [
            ['designation' => 'Phase 2 — accessibilité WCAG AA & lancement (Exemple)', 'unit' => 'jour', 'quantity' => 4, 'unit_price' => 550, 'discount_pct' => 0],
        ]);

        $acceptedQuote->forceFill(['total_amount' => 18500, 'indicative_mad_amount' => 18500])->save();

        $organization->payments()->create([
            'document_id' => $paidInvoice->id, 'recorded_by' => $user->id, 'amount' => 44000, 'currency' => 'MAD',
            'exchange_rate_to_mad' => 1, 'amount_received_mad' => 44000, 'bank_fees_mad' => 0,
            'received_on' => now()->subMonths(5)->addDays(12)->toDateString(), 'method' => 'Virement RIB Maroc', 'reference' => 'VIR-MA-7741200',
        ]);

        $organization->payments()->create([
            'document_id' => $sentInvoice->id, 'recorded_by' => $user->id, 'amount' => 800, 'currency' => 'EUR',
            'exchange_rate_to_mad' => 10.80, 'amount_received_mad' => 8640, 'bank_fees_mad' => 60,
            'received_on' => now()->subDays(15)->toDateString(), 'method' => 'Virement SWIFT EUR', 'reference' => 'SWF-EUR-5512038',
        ]);
    }
}
