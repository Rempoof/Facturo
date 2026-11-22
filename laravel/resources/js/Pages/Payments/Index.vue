<script setup lang="ts">
import { Head, Link, router, usePage } from '@inertiajs/vue3'
import CountryFlag from '@/Components/CountryFlag.vue'
import StatusBadge from '@/Components/StatusBadge.vue'
import { amountOnly, money } from '@/lib/utils'
import type { OrganizationSummary } from '@/types'

const props = defineProps<{
  payments: { data: any[]; links: Array<{ url: string | null; label: string; active: boolean }> }
  totals: { received_mad: number; fees_mad: number }
  filters: { currency?: string }
}>()

const page = usePage<{ organization: OrganizationSummary }>()
const org = page.props.organization
</script>

<template>
  <Head title="Paiements" />
  <div class="flex-1 bg-white p-6 lg:p-8">
    <header>
      <p class="text-[12.5px] text-[#667085]">Règlements reçus, montant crédité en dirhams</p>
      <h1 class="mt-1 text-[26px] font-bold tracking-[-0.025em]">Paiements</h1>
    </header>

    <div class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="rounded-[20px] bg-[#0F3D3A] p-5 text-white">
        <p class="text-[12.5px] text-[#D6EFE1]">Total net reçu en MAD</p>
        <p class="mt-2 text-[24px] font-bold tabular">{{ amountOnly(totals.received_mad) }} MAD</p>
      </div>
      <div class="rounded-[20px] border border-[#E3E6EC] p-5">
        <p class="text-[12.5px] text-[#667085]">Frais bancaires / change</p>
        <p class="mt-2 text-[24px] font-bold tabular">{{ amountOnly(totals.fees_mad) }} MAD</p>
      </div>
    </div>

    <div class="mt-5 flex items-center justify-between">
      <p class="text-[12.5px] text-[#667085]">Seul le montant reçu en MAD alimente le plafond annuel.</p>
      <select :value="filters.currency ?? ''" aria-label="Devise" class="rounded-[12px] border border-[#E3E6EC] px-3 py-2 text-[12px]" @change="router.get(`/${org.slug}/payments`, { currency: ($event.target as HTMLSelectElement).value || undefined }, { preserveState: true, replace: true })">
        <option value="">Toutes les devises</option><option>MAD</option><option>EUR</option><option>CHF</option><option>USD</option>
      </select>
    </div>

    <div class="mt-4 overflow-hidden rounded-[20px] border border-[#E3E6EC]">
      <table class="w-full text-start text-[12.5px]">
        <thead class="bg-[#F7F8FA] text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
          <tr><th class="px-5 py-3 text-start">Date</th><th class="px-4 py-3 text-start">Document & client</th><th class="px-4 py-3 text-start">Mode / référence</th><th class="px-4 py-3 text-end">Montant devisé</th><th class="px-4 py-3 text-end">Reçu en MAD</th><th class="px-5 py-3 text-end">Frais</th></tr>
        </thead>
        <tbody class="divide-y divide-[#F0F2F5]">
          <tr v-for="payment in payments.data" :key="payment.id" class="hover:bg-[#F8F9FB]">
            <td class="px-5 py-3.5 tabular text-[#525866]">{{ payment.received_on }}</td>
            <td class="px-4 py-3.5">
              <Link :href="`/${org.slug}/documents/${payment.document.id}`" class="font-semibold tabular hover:text-[#2457F5]">{{ payment.document.number }}</Link>
              <p class="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-[#667085]"><CountryFlag :code="payment.document.client.country_code" :size="13" />{{ payment.document.client.name }} <StatusBadge :status="payment.document.status" /></p>
            </td>
            <td class="px-4 py-3.5"><p>{{ payment.method }}</p><p class="text-[11px] text-[#667085] tabular">{{ payment.reference }}</p></td>
            <td class="px-4 py-3.5 text-end font-medium tabular">{{ money(payment.amount, payment.currency) }}</td>
            <td class="px-4 py-3.5 text-end font-bold text-[#0B6B3A] tabular">{{ money(payment.amount_received_mad, 'MAD') }}</td>
            <td class="px-5 py-3.5 text-end text-[#8A4B00] tabular">{{ Number(payment.bank_fees_mad) > 0 ? money(payment.bank_fees_mad, 'MAD') : '—' }}</td>
          </tr>
          <tr v-if="payments.data.length === 0"><td colspan="6" class="px-5 py-10 text-center text-[#667085]">Aucun paiement enregistré.</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
