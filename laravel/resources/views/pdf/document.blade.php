<!DOCTYPE html>
<html lang="{{ strtolower($lang) }}" dir="{{ $isRtl ? 'rtl' : 'ltr' }}">
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: {{ $isRtl ? 'xbriyaz' : 'dejavusans' }}, sans-serif; color: #14171F; font-size: 10.5pt; }
        .header { border-bottom: 1px solid #E3E6EC; padding-bottom: 10px; }
        .title { font-size: 17pt; font-weight: bold; margin: 0; }
        .muted { color: #667085; font-size: 9pt; }
        .badge { display: inline-block; background: #E8EAEE; color: #3F4654; padding: 2px 7px; border-radius: 5px; font-size: 8pt; }
        table.items { width: 100%; border-collapse: collapse; margin-top: 8px; }
        table.items th { background: #F8F9FB; color: #667085; font-size: 8.5pt; text-align: {{ $isRtl ? 'right' : 'left' }}; padding: 6px; border-bottom: 1px solid #ECEEF2; }
        table.items td { padding: 7px 6px; border-bottom: 1px solid #F0F2F5; font-size: 9.5pt; }
        .num { text-align: {{ $isRtl ? 'left' : 'right' }}; }
        .totals td { padding: 3px 6px; font-size: 9.5pt; }
        .grand td { font-weight: bold; font-size: 11.5pt; border-top: 1px solid #E3E6EC; padding-top: 6px; }
        .legal { background: #F8F9FB; border: 1px solid #E3E6EC; border-radius: 6px; padding: 8px; font-size: 8.2pt; color: #525866; margin-top: 10px; }
        .footer { margin-top: 14px; font-size: 8.8pt; color: #525866; }
        .emblem { float: {{ $isRtl ? 'left' : 'right' }}; width: 42px; height: 42px; border-radius: 21px; background: #0F3D3A; color: #BFF0D4; text-align: center; font-size: 18pt; line-height: 42px; }
        .two-col { width: 100%; margin-top: 10px; }
        .two-col td { vertical-align: top; width: 50%; font-size: 9pt; }
    </style>
</head>
<body>
    @php($gbp = fn ($v) => number_format((float) $v, 2, ',', ' '))
    <div class="emblem">+</div>
    <div class="header">
        <p class="title">{{ $title }}</p>
        <p class="muted">{{ $labels['doc_no'] }} :
            @if ($document->number)
                <strong>#{{ $document->number }}</strong>
            @else
                <span class="badge">{{ $labels['draft'] }}</span>
            @endif
        </p>
    </div>

    <table class="two-col">
        <tr>
            <td>
                <p class="muted">{{ $labels['issued_by'] }}</p>
                <strong>{{ $organization->name }}</strong><br>
                {{ $organization->address }} {{ $organization->city }}<br>
                ICE : {{ $organization->ice }}<br>
                {{ $labels['ae'] }} : {{ $organization->auto_entrepreneur_number }}
            </td>
            <td>
                <p class="muted">{{ $labels['billed_to'] }}</p>
                <strong>{{ $client->name }}</strong><br>
                {{ $client->address }} {{ $client->city }} — {{ $client->country_code }}<br>
                {{ $client->taxIdLabel() }} : {{ $client->tax_id }}
            </td>
        </tr>
    </table>

    <table class="two-col">
        <tr>
            <td><span class="muted">{{ $labels['issue_date'] }}</span><br><strong>{{ $document->issue_date->format('d/m/Y') }}</strong></td>
            <td><span class="muted">{{ $document->type->isQuote() ? $labels['valid_until'] : $labels['due_date'] }}</span><br><strong>{{ $document->due_date->format('d/m/Y') }}</strong></td>
        </tr>
    </table>

    <table class="items">
        <thead>
            <tr>
                <th>{{ $labels['designation'] }}</th>
                <th>{{ $labels['qty'] }}</th>
                <th>{{ $labels['unit'] }}</th>
                <th class="num">{{ $labels['price'] }}</th>
                <th class="num">{{ $labels['amount'] }}</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($lines as $line)
                <tr>
                    <td>{{ $line->designation }}@if ((float) $line->discount_pct > 0) <span class="muted">({{ $labels['discount'] }} -{{ rtrim(rtrim(number_format((float) $line->discount_pct, 2, ',', ''), '0'), ',') }} %)</span>@endif</td>
                    <td>{{ rtrim(rtrim(number_format((float) $line->quantity, 2, ',', ''), '0'), ',') }}</td>
                    <td>{{ $line->unit }}</td>
                    <td class="num">{{ $gbp($line->unit_price) }}</td>
                    <td class="num">{{ $gbp($line->line_total) }} {{ $document->currency->value }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals" style="width: 48%; margin-{{ $isRtl ? 'right' : 'left' }}: auto; margin-top: 8px;">
        <tr><td>{{ $labels['subtotal'] }}</td><td class="num">{{ $gbp($document->subtotal) }} {{ $document->currency->value }}</td></tr>
        @if ((float) $document->discount_amount > 0)
            <tr><td>{{ $labels['global_discount'] }}</td><td class="num">-{{ $gbp($document->discount_amount) }} {{ $document->currency->value }}</td></tr>
        @endif
        <tr><td class="muted">{{ $labels['vat'] }}</td><td class="num muted">0,00 {{ $document->currency->value }}</td></tr>
        <tr class="grand"><td>{{ $document->type === \App\Enums\DocumentType::Avoir ? $labels['credit'] : $labels['total'] }}</td><td class="num">{{ $gbp($document->total_amount) }} {{ $document->currency->value }}</td></tr>
        @if ($document->currency->value !== 'MAD')
            <tr><td class="muted">{{ $labels['indicative'] }}</td><td class="num muted">≈ {{ $gbp($document->indicative_mad_amount) }} MAD</td></tr>
        @endif
    </table>

    <div class="legal">
        {{ $document->legal_mention }}
        @if ($document->notes)<br>{{ $document->notes }}@endif
    </div>

    <div class="footer">
        <strong>{{ $labels['payment'] }}</strong><br>
        {{ $labels['method'] }} : {{ $document->payment_method }} — {{ $labels['terms'] }} : {{ $document->payment_terms }}<br>
        @if ($bank)
            {{ $bank['bank_name'] }}<br>
            {{ $bank['currency'] === 'MAD' ? 'RIB' : 'IBAN' }} : {{ $bank['rib_or_iban'] }}
            @if ($bank['currency'] !== 'MAD') — BIC : {{ $bank['swift_bic'] }}@endif
        @endif
        <br><br>
        <strong>{{ $organization->name }}</strong> — {{ $labels['signature'] }}
    </div>
</body>
</html>
