<?php

namespace App\Services;

use App\Models\Document;
use Illuminate\Support\Facades\Storage;
use Mpdf\Mpdf;

/**
 * Renders the A4 document in French, English or Arabic.
 * Arabic switches the whole sheet to RTL and uses the IBM Plex Sans Arabic
 * family, matching the preview shown in the create screen.
 */
class PdfRenderer
{
    public function render(Document $document, bool $store = true): string
    {
        $document->loadMissing(['client', 'organization', 'lines', 'payments']);

        $language = strtoupper((string) $document->language);
        $isRtl = $language === 'AR';

        $mpdf = new Mpdf([
            'mode' => 'utf-8',
            'format' => 'A4',
            'margin_left' => 14,
            'margin_right' => 14,
            'margin_top' => 14,
            'margin_bottom' => 18,
            'default_font' => $isRtl ? 'xbriyaz' : 'dejavusans',
            'directionality' => $isRtl ? 'rtl' : 'ltr',
            'tempDir' => storage_path('app/mpdf'),
        ]);

        $mpdf->SetTitle("{$document->type->titles()[$this->key($language)]} {$document->number}");
        $mpdf->SetAuthor($document->organization->name);
        $mpdf->SetFooter('{PAGENO}/{nbpg}');

        $html = view('pdf.document', [
            'document' => $document,
            'organization' => $document->organization,
            'client' => $document->client,
            'lines' => $document->lines,
            'lang' => $language,
            'isRtl' => $isRtl,
            'title' => $document->type->titles()[$this->key($language)],
            'bank' => $document->organization->bankAccountFor($document->currency->value),
            'labels' => $this->labels($language),
        ])->render();

        $mpdf->WriteHTML($html);
        $output = $mpdf->Output("{$document->number}.pdf", \Mpdf\Output\Destination::STRING_RETURN);

        if ($store) {
            Storage::disk('local')->put("documents/{$document->id}/{$document->number}-{$language}.pdf", $output);
        }

        return $output;
    }

    private function key(string $language): string
    {
        return match ($language) {
            'AR' => 'ar',
            'EN' => 'en',
            default => 'fr',
        };
    }

    /** @return array<string, string> */
    private function labels(string $language): array
    {
        $fr = [
            'doc_no' => 'Numéro', 'draft' => "Attribué à l'émission", 'issued_by' => 'Émis par',
            'billed_to' => 'Adressé à', 'issue_date' => "Date d'émission", 'due_date' => "Date d'échéance",
            'valid_until' => 'Date de validité', 'items' => 'Prestations / Lignes de service',
            'designation' => 'Désignation', 'qty' => 'Qté', 'unit' => 'Unité', 'price' => 'P.U. HT',
            'discount' => 'Rem.', 'amount' => 'Montant', 'subtotal' => 'Sous-total HT',
            'global_discount' => 'Remise globale', 'vat' => 'TVA (0 % — Régime AE)',
            'deposit' => 'Acompte demandé', 'total' => 'Total net à payer', 'credit' => 'Net à déduire (Avoir)',
            'indicative' => 'Équivalent indicatif en dirhams', 'payment' => 'Règlement & coordonnées bancaires',
            'method' => 'Mode', 'terms' => 'Conditions', 'ae' => "N° Auto-Entrepreneur", 'signature' => 'Signature & cachet',
        ];

        if ($language === 'EN') {
            return array_merge($fr, [
                'doc_no' => 'Document No.', 'draft' => 'Assigned upon issue', 'issued_by' => 'Issued by',
                'billed_to' => 'Billed to', 'issue_date' => 'Issue date', 'due_date' => 'Due date',
                'valid_until' => 'Valid until', 'items' => 'Services & deliverables',
                'designation' => 'Description', 'qty' => 'Qty', 'unit' => 'Unit', 'price' => 'Unit price',
                'discount' => 'Disc.', 'amount' => 'Amount', 'subtotal' => 'Subtotal',
                'global_discount' => 'Global discount', 'vat' => 'VAT (0% — AE exempt)',
                'deposit' => 'Requested deposit', 'total' => 'Grand total due', 'credit' => 'Total credit note',
                'indicative' => 'Indicative MAD equivalent', 'payment' => 'Payment & bank details',
                'method' => 'Method', 'terms' => 'Terms', 'ae' => 'Auto-Entrepreneur ID', 'signature' => 'Authorized signature',
            ]);
        }

        if ($language === 'AR') {
            return [
                'doc_no' => 'رقم الوثيقة', 'draft' => 'يُخصص عند الإصدار الرسمي', 'issued_by' => 'صادر عن',
                'billed_to' => 'موجّه إلى', 'issue_date' => 'تاريخ الإصدار', 'due_date' => 'تاريخ الاستحقاق',
                'valid_until' => 'صالح إلى غاية', 'items' => 'تفاصيل الخدمات',
                'designation' => 'بيان الخدمة', 'qty' => 'الكمية', 'unit' => 'الوحدة', 'price' => 'ثمن الوحدة',
                'discount' => 'تخفيض', 'amount' => 'المبلغ', 'subtotal' => 'المجموع الفرعي',
                'global_discount' => 'تخفيض إجمالي', 'vat' => 'الضريبة على القيمة المضافة (0 %)',
                'deposit' => 'التسبيق المطلوب', 'total' => 'المبلغ الإجمالي الواجب أداؤه', 'credit' => 'المبلغ الصافي للإشعار الدائن',
                'indicative' => 'المقابل التقريبي بالدرهم', 'payment' => 'معلومات الأداء والتحويل البنكي',
                'method' => 'طريقة الأداء', 'terms' => 'شروط الدفع', 'ae' => 'رقم المقاول الذاتي', 'signature' => 'التوقيع والخاتم',
            ];
        }

        return $fr;
    }
}
