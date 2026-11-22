<script setup lang="ts">
import { computed } from 'vue'
import { Lock, ShieldCheck } from 'lucide-vue-next'
import CountryFlag from './CountryFlag.vue'
import { money } from '@/lib/utils'

const props = defineProps<{
  docType: string
  number: string | null
  language: string
  currency: string
  rateToMad: number
  issueDate: string
  dueDate: string
  globalDiscountPct?: number
  depositPct?: number
  lines: Array<{ designation: string; unit: string; quantity: number; unit_price: number; discount_pct: number }>
  issuer: { name: string; address?: string | null; city?: string | null; ice?: string | null; ae?: string | null }
  client: { name: string; address?: string | null; city?: string | null; country_code: string; tax_id?: string | null; tax_id_label?: string }
  legalMention: string
  paymentMethod: string
  paymentTerms: string
  bank?: { bank_name?: string; rib_or_iban?: string; swift_bic?: string | null; currency?: string } | null
  notes?: string | null
}>()

const titles: Record<string, string> = {
  devis: 'DEVIS', proforma: 'FACTURE PROFORMA', facture: 'FACTURE', acompte: "FACTURE D'ACOMPTE", avoir: "FACTURE D'AVOIR",
}
const titlesEn: Record<string, string> = { devis: 'QUOTE', proforma: 'PROFORMA INVOICE', facture: 'INVOICE', acompte: 'DEPOSIT INVOICE', avoir: 'CREDIT NOTE' }
const titlesAr: Record<string, string> = { devis: 'عرض أثمان', proforma: 'فاتورة أولية', facture: 'فاتورة', acompte: 'فاتورة تسبيق', avoir: 'إشعار دائن' }

const isRtl = computed(() => props.language === 'AR')
const title = computed(() => {
  if (isRtl.value) return titlesAr[props.docType] ?? 'فاتورة'
  if (props.language === 'EN') return titlesEn[props.docType] ?? 'INVOICE'
  return titles[props.docType] ?? 'FACTURE'
})

const labels = computed(() => isRtl.value
  ? { no: 'رقم الوثيقة', draft: 'يُخصص عند الإصدار', by: 'صادر عن', to: 'موجّه إلى', issue: 'تاريخ الإصدار', due: 'تاريخ الاستحقاق', desc: 'بيان الخدمة', qty: 'الكمية', unit: 'الوحدة', price: 'ثمن الوحدة', amount: 'المبلغ', subtotal: 'المجموع الفرعي', total: 'المبلغ الإجمالي', mad: 'المقابل بالدرهم', payment: 'معلومات الأداء', method: 'طريقة الأداء', terms: 'الشروط', signature: 'التوقيع والخاتم' }
  : props.language === 'EN'
    ? { no: 'Document No.', draft: 'Assigned upon issue', by: 'Issued by', to: 'Billed to', issue: 'Issue date', due: 'Due date', desc: 'Description', qty: 'Qty', unit: 'Unit', price: 'Unit price', amount: 'Amount', subtotal: 'Subtotal', total: 'Grand total due', mad: 'Indicative MAD', payment: 'Payment & bank details', method: 'Method', terms: 'Terms', signature: 'Signature' }
    : { no: 'Numéro', draft: "Attribué à l'émission", by: 'Émis par', to: 'Adressé à', issue: "Date d'émission", due: "Date d'échéance", desc: 'Désignation', qty: 'Qté', unit: 'Unité', price: 'P.U. HT', amount: 'Montant', subtotal: 'Sous-total HT', total: 'Total net à payer', mad: 'Équivalent indicatif', payment: 'Règlement & coordonnées bancaires', method: 'Mode', terms: 'Conditions', signature: 'Signature & cachet' })

const subtotal = computed(() => props.lines.reduce((sum, line) => sum + line.quantity * line.unit_price * (1 - (line.discount_pct || 0) / 100), 0))
const discount = computed(() => subtotal.value * ((props.globalDiscountPct ?? 0) / 100))
const net = computed(() => Math.max(0, subtotal.value - discount.value) * (props.docType === 'avoir' ? -1 : 1))
const total = computed(() => (props.docType === 'acompte' && (props.depositPct ?? 0) > 0 ? net.value * ((props.depositPct ?? 0) / 100) : net.value))
const rate = computed(() => (props.currency === 'MAD' ? 1 : props.rateToMad || 1))
</script>

<template>
  <article dir="rtl" :dir="isRtl ? 'rtl' : 'ltr'" class="paper-light mx-auto w-full max-w-[560px] rounded-[14px] border border-[#E3E6EC] bg-white p-7 text-[11.5px] text-[#14171F] shadow-[0_20px_48px_rgba(20,23,31,0.07)]" :class="isRtl ? 'font-arabic text-right' : ''">
    <header class="flex items-start justify-between gap-4">
      <div>
        <h3 class="text-[21px] font-bold tracking-[-0.02em]">{{ title }}</h3>
        <p class="mt-1.5 flex items-center gap-2 text-[11px]">
          <span class="text-muted">{{ labels.no }} :</span>
          <span v-if="number" class="inline-flex items-center gap-1 font-semibold tabular">
            <ShieldCheck class="h-3.5 w-3.5 text-[#0B6B3A]" /> #{{ number }}
          </span>
          <span v-else class="inline-flex items-center gap-1 rounded-md bg-[#E8EAEE] px-2 py-0.5 text-[10.5px] font-medium text-[#3F4654]">
            <Lock class="h-3 w-3" /> {{ labels.draft }}
          </span>
        </p>
      </div>
      <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0F3D3A] text-[20px] font-bold text-[#BFF0D4]">+</span>
    </header>

    <div class="mt-5 grid grid-cols-2 gap-5 border-t border-[#ECEEF2] pt-4">
      <div class="space-y-0.5">
        <p class="text-[10.5px] text-muted">{{ labels.by }}</p>
        <p class="text-[12px] font-semibold">{{ issuer.name }}</p>
        <p class="text-[10.5px] text-muted">{{ issuer.address }} {{ issuer.city }}</p>
        <p class="text-[10px]">ICE : {{ issuer.ice }}</p>
        <p class="text-[10px]">N° AE : {{ issuer.ae }}</p>
      </div>
      <div class="space-y-0.5">
        <p class="text-[10.5px] text-muted">{{ labels.to }}</p>
        <p class="flex items-center gap-1.5 text-[12px] font-semibold">
          <CountryFlag :code="client.country_code" :size="14" /> {{ client.name }}
        </p>
        <p class="text-[10.5px] text-muted">{{ client.address }} {{ client.city }}</p>
        <p class="text-[10px]">{{ client.tax_id_label }} : {{ client.tax_id }}</p>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-5 text-[11px]">
      <div><p class="text-[10.5px] text-muted">{{ labels.issue }}</p><p class="font-semibold tabular">{{ issueDate }}</p></div>
      <div><p class="text-[10.5px] text-muted">{{ labels.due }}</p><p class="font-semibold tabular">{{ dueDate }}</p></div>
    </div>

    <table class="mt-5 w-full border-collapse overflow-hidden rounded-[10px]">
      <thead>
        <tr class="bg-[#F8F9FB] text-[10px] font-semibold text-muted">
          <th class="px-3 py-2 text-start">{{ labels.desc }}</th>
          <th class="px-2 py-2 text-center">{{ labels.qty }}</th>
          <th class="px-2 py-2 text-center">{{ labels.unit }}</th>
          <th class="px-3 py-2 text-end">{{ labels.amount }}</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-[#F0F2F5] text-[11px]">
        <tr v-for="(line, index) in lines" :key="index">
          <td class="px-3 py-2.5 font-medium">{{ line.designation || '—' }}</td>
          <td class="px-2 py-2.5 text-center tabular">{{ line.quantity }}</td>
          <td class="px-2 py-2.5 text-center text-muted">{{ line.unit }}</td>
          <td class="px-3 py-2.5 text-end font-semibold tabular">
            {{ money(line.quantity * line.unit_price * (1 - (line.discount_pct || 0) / 100) * (docType === 'avoir' ? -1 : 1), currency) }}
          </td>
        </tr>
      </tbody>
    </table>

    <div class="mt-4 space-y-1.5 border-t border-[#ECEEF2] pt-3 text-[11px]">
      <div class="flex justify-between"><span class="text-secondary">{{ labels.subtotal }}</span><span class="font-medium tabular">{{ money(subtotal, currency) }}</span></div>
      <div v-if="discount > 0" class="flex justify-between"><span class="text-secondary">Remise globale ({{ globalDiscountPct }} %)</span><span class="font-medium text-[#A31D1D] tabular">-{{ money(discount, currency) }}</span></div>
      <div class="flex justify-between text-[10.5px] text-muted"><span>TVA (0 % — Régime AE)</span><span class="tabular">0,00 {{ currency }}</span></div>
      <div class="flex justify-between border-t border-[#E3E6EC] pt-2 text-[13px] font-bold"><span>{{ labels.total }}</span><span class="tabular">{{ money(total, currency) }}</span></div>
      <div v-if="currency !== 'MAD'" class="flex justify-between rounded-[8px] bg-[#F3F4F6] px-2.5 py-1.5 text-[10px] text-secondary">
        <span>{{ labels.mad }} (1 {{ currency }} = {{ rate }} MAD)</span>
        <span class="font-semibold text-[#0F3D3A] tabular">≈ {{ money(total * rate, 'MAD') }}</span>
      </div>
    </div>

    <div class="mt-4 rounded-[10px] border border-[#E3E6EC] bg-[#F8F9FB] px-3 py-2 text-[9.8px] leading-relaxed text-secondary">
      <p class="font-medium text-[#3F4654]">{{ legalMention }}</p>
      <p v-if="notes" class="mt-1 text-muted">{{ notes }}</p>
    </div>

    <footer class="mt-5 flex items-end justify-between gap-4">
      <div class="space-y-0.5 text-[10px] text-secondary">
        <p class="font-semibold text-[#14171F]">{{ labels.payment }}</p>
        <p>{{ labels.method }} : {{ paymentMethod }} · {{ labels.terms }} : {{ paymentTerms }}</p>
        <p v-if="bank" class="font-medium tabular">{{ bank.currency === 'MAD' ? 'RIB' : 'IBAN' }} : {{ bank.rib_or_iban }}</p>
        <p v-if="bank && bank.currency !== 'MAD'" class="text-muted">BIC / SWIFT : {{ bank.swift_bic }}</p>
      </div>
      <div class="shrink-0 text-center">
        <p class="text-[10.5px] font-semibold">{{ issuer.name }}</p>
        <p class="text-[9px] text-muted">{{ labels.signature }}</p>
      </div>
    </footer>
  </article>
</template>
