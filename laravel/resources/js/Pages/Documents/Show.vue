<script setup lang="ts">
import { computed, ref } from 'vue'
import { Head, Link, useForm, usePage } from '@inertiajs/vue3'
import { ArrowLeft, Banknote, CheckCircle2, Clock, Download, Lock, ShieldCheck } from 'lucide-vue-next'
import DocumentPaper from '@/Components/DocumentPaper.vue'
import StatusBadge from '@/Components/StatusBadge.vue'
import { money } from '@/lib/utils'
import type { OrganizationSummary } from '@/types'

const props = defineProps<{
  document: any
  bank: any
  receivedMad: number
  remainingMad: number
  paymentMethods: string[]
  openPayment?: boolean
}>()

const page = usePage<{ organization: OrganizationSummary; auth: { user: { name: string } } }>()
const org = page.props.organization
const modal = ref(Boolean(new URLSearchParams(page.url.split('?')[1] ?? '').get('pay')))

const form = useForm({
  amount: Number(props.document.total_amount),
  currency: props.document.currency,
  exchange_rate_to_mad: Number(props.document.exchange_rate_to_mad),
  amount_received_mad: props.document.currency === 'MAD' ? Number(props.document.total_amount) : Number(props.document.indicative_mad_amount),
  bank_fees_mad: props.document.currency === 'MAD' ? 0 : 180,
  received_on: new Date().toISOString().slice(0, 10),
  method: props.document.currency === 'MAD' ? 'Virement bancaire RIB Maroc' : 'Virement SEPA / SWIFT',
  reference: '',
  notes: '',
})

function submitPayment() {
  form.post(`/${org.slug}/documents/${props.document.id}/payments`, {
    preserveScroll: true,
    onSuccess: () => { modal.value = false; form.reset('reference', 'notes') },
  })
}

const timeline = computed(() => [
  { key: 'created', label: 'Créé', done: true, at: props.document.created_at },
  { key: 'sent', label: 'Envoyé', done: Boolean(props.document.sent_at), at: props.document.sent_at },
  { key: 'viewed', label: 'Vu par le client', done: Boolean(props.document.viewed_at), at: props.document.viewed_at },
  { key: 'paid', label: 'Payé', done: props.document.status === 'paid', at: props.document.paid_at },
])
</script>

<template>
  <Head :title="document.number ?? 'Document'" />
  <div class="flex-1 bg-[#F3F4F6] p-6 lg:p-7 space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-[#E3E6EC] bg-white px-5 py-4">
      <div class="flex items-center gap-3.5">
        <Link :href="`/${org.slug}/documents`" class="rounded-[10px] border border-[#E3E6EC] p-2 text-[#3F4654] hover:bg-[#F3F4F6]" aria-label="Retour"><ArrowLeft class="h-4 w-4" /></Link>
        <div>
          <div class="flex flex-wrap items-center gap-2.5">
            <h1 class="text-[19px] font-bold text-[#14171F] tabular">{{ document.number ?? 'Brouillon non numéroté' }}</h1>
            <StatusBadge :status="document.status" />
            <span v-if="document.is_locked" class="inline-flex items-center gap-1 rounded-full bg-[#0F3D3A]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#0F3D3A]">
              <ShieldCheck class="h-3.5 w-3.5" /> Document émis verrouillé
            </span>
          </div>
          <p class="mt-0.5 text-[12.5px] text-[#667085]">
            {{ document.client.name }} · {{ document.language }} · {{ money(document.total_amount, document.currency) }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2.5">
        <a :href="`/${org.slug}/documents/${document.id}/pdf`" target="_blank" class="inline-flex items-center gap-1.5 rounded-[12px] border border-[#E3E6EC] bg-white px-3.5 py-2 text-[12.5px] font-semibold hover:bg-[#F8F9FB]">
          <Download class="h-4 w-4" /> Télécharger PDF ({{ document.language }})
        </a>
        <button v-if="document.status !== 'paid'" type="button" class="inline-flex items-center gap-2 rounded-[12px] bg-[#2457F5] px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-[#1B45C9]" @click="modal = true">
          <Banknote class="h-4 w-4" /> Enregistrer un paiement
        </button>
      </div>
    </div>

    <div v-if="!document.is_locked" class="rounded-[14px] border border-[#8A4B00]/25 bg-[#FFF0D6] px-4 py-3 text-[12.5px] text-[#8A4B00]">
      Brouillon : aucun numéro consommé. L'émission attribuera <strong>le numéro séquentiel</strong> et verrouillera définitivement le document.
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div class="lg:col-span-7">
        <DocumentPaper
          :doc-type="document.type"
          :number="document.number"
          :language="document.language"
          :currency="document.currency"
          :rate-to-mad="Number(document.exchange_rate_to_mad)"
          :issue-date="document.issue_date"
          :due-date="document.due_date"
          :global-discount-pct="Number(document.global_discount_pct)"
          :deposit-pct="Number(document.deposit_requested_pct)"
          :lines="document.lines.map((l: any) => ({ designation: l.designation, unit: l.unit, quantity: Number(l.quantity), unit_price: Number(l.unit_price), discount_pct: Number(l.discount_pct) }))"
          :issuer="{ name: org.name, address: null, city: null, ice: org.ice, ae: org.auto_entrepreneur_number }"
          :client="{ name: document.client.name, address: document.client.address, city: document.client.city, country_code: document.client.country_code, tax_id: document.client.tax_id, tax_id_label: document.client.tax_id_label }"
          :legal-mention="document.legal_mention ?? ''"
          :payment-method="document.payment_method ?? ''"
          :payment-terms="document.payment_terms ?? ''"
          :bank="bank"
          :notes="document.notes"
        />
      </div>

      <div class="lg:col-span-5 space-y-5">
        <section class="rounded-[20px] border border-[#E3E6EC] bg-white p-5">
          <h2 class="text-[15px] font-bold text-[#14171F]">Historique & cycle de vie</h2>
          <ol class="mt-4 space-y-4">
            <li v-for="step in timeline" :key="step.key" class="flex items-start gap-3">
              <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full" :class="step.done ? 'bg-[#DDF5E6] text-[#0B6B3A]' : 'bg-[#F3F4F6] text-[#98A2B3]'">
                <CheckCircle2 v-if="step.done" class="h-4 w-4" /><Clock v-else class="h-4 w-4" />
              </span>
              <div class="flex-1 border-b border-[#F0F2F5] pb-3 last:border-none last:pb-0">
                <p class="text-[13px] font-semibold" :class="step.done ? 'text-[#14171F]' : 'text-[#667085]'">{{ step.label }}</p>
                <p class="text-[11.5px] text-[#667085] tabular">{{ step.at ?? 'En attente' }}</p>
              </div>
            </li>
          </ol>
        </section>

        <section class="rounded-[20px] border border-[#E3E6EC] bg-white p-5">
          <div class="flex items-center justify-between">
            <h2 class="text-[15px] font-bold text-[#14171F]">Règlements reçus en MAD</h2>
            <button type="button" class="text-[12px] font-semibold text-[#2457F5] hover:underline" @click="modal = true">+ Ajouter</button>
          </div>
          <p class="mt-2 text-[12px] text-[#667085]">Reçu : <strong class="text-[#0B6B3A] tabular">{{ money(receivedMad, 'MAD') }}</strong> · Reste : <strong class="tabular">{{ money(remainingMad, 'MAD') }}</strong></p>

          <div v-if="document.payments.length === 0" class="mt-4 rounded-[14px] border border-dashed border-[#E3E6EC] bg-[#F8F9FB] p-5 text-center">
            <p class="text-[13px] font-semibold text-[#14171F]">Aucun paiement enregistré</p>
            <p class="mt-0.5 text-[12px] text-[#667085]">Saisissez le montant crédité en MAD sur votre relevé pour mettre à jour votre plafond.</p>
          </div>
          <div v-else class="mt-4 space-y-3">
            <div v-for="payment in document.payments" :key="payment.id" class="rounded-[14px] border border-[#E3E6EC] bg-[#F8F9FB] p-3.5">
              <div class="flex items-center justify-between">
                <span class="text-[12px] font-semibold tabular">Payé : {{ money(payment.amount, payment.currency) }}</span>
                <span class="rounded-full bg-[#DDF5E6] px-2.5 py-0.5 text-[11.5px] font-bold text-[#0B6B3A] tabular">+{{ money(payment.amount_received_mad, 'MAD') }} net reçus</span>
              </div>
              <p class="mt-1 text-[11px] text-[#667085] tabular">{{ payment.received_on }} · {{ payment.method }} · Réf : {{ payment.reference ?? '—' }}</p>
              <p v-if="Number(payment.bank_fees_mad) > 0" class="text-[11px] text-[#8A4B00] tabular">Frais bancaires : {{ money(payment.bank_fees_mad, 'MAD') }}</p>
            </div>
          </div>
        </section>
      </div>
    </div>

    <div v-if="modal" role="dialog" aria-modal="true" class="fixed inset-0 z-50 flex items-center justify-center bg-[#14171F]/45 p-4">
      <form class="w-full max-w-[490px] space-y-4 rounded-[20px] border border-[#E3E6EC] bg-white p-6 shadow-xl" @submit.prevent="submitPayment">
        <div>
          <h3 class="text-[17px] font-bold text-[#14171F]">Enregistrer un paiement</h3>
          <p class="mt-0.5 text-[12.5px] text-[#667085]">{{ document.number }} · {{ document.client.name }}</p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <label><span class="text-[11px] text-[#525866]">Montant payé ({{ document.currency }}) *</span>
            <input v-model.number="form.amount" type="number" step="0.01" class="mt-1 w-full rounded-[12px] border border-[#E3E6EC] px-3 py-2.5 text-[13px] font-bold tabular" />
          </label>
          <label><span class="text-[11px] font-semibold text-[#0B6B3A]">Montant net reçu en MAD *</span>
            <input v-model.number="form.amount_received_mad" type="number" step="0.01" class="mt-1 w-full rounded-[12px] border border-[#0B6B3A] bg-[#F2FBF6] px-3 py-2.5 text-[13px] font-bold text-[#0B6B3A] tabular" />
            <span v-if="form.errors.amount_received_mad" class="text-[11px] font-medium text-[#A31D1D]">{{ form.errors.amount_received_mad }}</span>
          </label>
        </div>

        <p class="rounded-[12px] bg-[#0F3D3A]/5 px-3.5 py-2.5 text-[11.5px] text-[#0F3D3A]">
          <strong>Règle Auto-Entrepreneur :</strong> seul le montant effectivement encaissé en MAD alimente votre plafond et vos déclarations.
        </p>

        <div class="grid grid-cols-2 gap-3">
          <label><span class="text-[11px] text-[#525866]">Frais bancaires / change (MAD)</span>
            <input v-model.number="form.bank_fees_mad" type="number" step="0.01" class="mt-1 w-full rounded-[12px] border border-[#E3E6EC] px-3 py-2.5 text-[13px] tabular" />
          </label>
          <label><span class="text-[11px] text-[#525866]">Date de réception *</span>
            <input v-model="form.received_on" type="date" class="mt-1 w-full rounded-[12px] border border-[#E3E6EC] px-3 py-2.5 text-[13px] tabular" />
          </label>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <label><span class="text-[11px] text-[#525866]">Mode de règlement</span>
            <select v-model="form.method" class="mt-1 w-full rounded-[12px] border border-[#E3E6EC] px-3 py-2.5 text-[12.5px]">
              <option v-for="method in paymentMethods" :key="method">{{ method }}</option>
            </select>
          </label>
          <label><span class="text-[11px] text-[#525866]">Référence de virement</span>
            <input v-model="form.reference" type="text" class="mt-1 w-full rounded-[12px] border border-[#E3E6EC] px-3 py-2.5 text-[12.5px] tabular" />
          </label>
        </div>

        <div class="flex items-center justify-end gap-2.5">
          <button type="button" class="rounded-[12px] border border-[#E3E6EC] px-4 py-2.5 text-[13px] font-semibold" @click="modal = false">Annuler</button>
          <button type="submit" class="inline-flex items-center gap-2 rounded-[12px] bg-[#2457F5] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1B45C9]" :disabled="form.processing">
            <Banknote class="h-4 w-4" /> Valider l'encaissement
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
