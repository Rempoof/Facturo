<script setup lang="ts">
import { computed, ref } from 'vue'
import { Head, useForm, usePage } from '@inertiajs/vue3'
import { Calendar, ChevronUp, FileText, Globe, Hash, Lock, Mail, Plus, Send, ShieldAlert, Sparkles, Trash2 } from 'lucide-vue-next'
import CountryFlag from '@/Components/CountryFlag.vue'
import DocumentPaper from '@/Components/DocumentPaper.vue'
import { money } from '@/lib/utils'
import type { ClientSummary, DocumentLinePayload, OrganizationSummary } from '@/types'

const props = defineProps<{
  type: string
  numberPreview: string
  clients: ClientSummary[]
  projects: Array<{ id: number; code: string; name: string; client_id: number; currency: string; tasks: Array<{ id: number; title: string; unit: string; quantity: string; unit_price: string }> }>
  services: Array<{ id: number; code: string; title_fr: string; title_en: string; title_ar: string; unit: string; unit_price_mad: string }>
  defaults: Record<string, any>
  legalMentions: Record<string, string>
  bankAccounts: Array<{ key: string; currency: string; bank_name: string; rib_or_iban: string; swift_bic: string | null }>
}>()

const page = usePage<{ organization: OrganizationSummary }>()
const org = page.props.organization

type Line = DocumentLinePayload
const form = useForm({
  type: props.type,
  client_id: props.defaults.client_id as number | null,
  project_id: props.defaults.project_id as number | null,
  language: props.defaults.language as string,
  currency: props.defaults.currency as string,
  exchange_rate_to_mad: props.defaults.exchange_rate_to_mad as number,
  issue_date: props.defaults.issue_date as string,
  due_date: props.defaults.due_date as string,
  vat_regime: props.defaults.vat_regime as string,
  payment_method: 'Virement bancaire SEPA / SWIFT',
  payment_terms: '30 jours nets',
  bank_account_key: props.defaults.bank_account_key as string | null,
  notes: "Merci d'indiquer le numéro de document en référence de virement (Exemple).",
  legal_mention: '' as string,
  global_discount_pct: 0,
  deposit_requested_pct: 0,
  issue_now: false,
  lines: (props.defaults.lines as Line[]).map((line) => ({ ...line })) as Line[],
})

const showPreview = ref(true)
const previewMode = ref<'pdf' | 'email'>('pdf')
const confirmOpen = ref(false)

const docTabs = [
  { key: 'devis', label: 'Devis' },
  { key: 'proforma', label: 'Proforma' },
  { key: 'facture', label: 'Facture' },
  { key: 'acompte', label: 'Acompte' },
  { key: 'avoir', label: 'Avoir' },
]

const rates: Record<string, number> = { MAD: 1, EUR: 10.8, CHF: 11.35, USD: 9.95 }
const currencies: Record<string, string> = { MAD: 'MA', EUR: 'EU', CHF: 'CH', USD: 'US' }

const client = computed(() => props.clients.find((c) => c.id === form.client_id) ?? props.clients[0])
const bank = computed(() => props.bankAccounts.find((b) => b.currency === form.currency) ?? props.bankAccounts[0])
const legalMention = computed(() => form.legal_mention
  || props.legalMentions[`${form.vat_regime === 'export_hors_champ' ? 'export' : 'ma'}${form.language}`]
  || '')
const isRtlUi = computed(() => false)

const banksCount = computed(() => props.bankAccounts.length)

function selectClient(id: number) {
  form.client_id = id
  const found = props.clients.find((c) => c.id === id)
  if (!found) return
  form.currency = found.default_currency ?? 'MAD'
  form.exchange_rate_to_mad = rates[form.currency] ?? 1
  form.language = found.preferred_language ?? 'FR'
  form.vat_regime = found.country_code === 'MA' ? 'franchise_ae' : 'export_hors_champ'
  form.bank_account_key = bank.value?.key ?? null
}

function selectCurrency(code: string) {
  form.currency = code
  form.exchange_rate_to_mad = rates[code] ?? 1
  form.bank_account_key = bank.value?.key ?? null
}

function addLine() {
  form.lines.push({ designation: '', unit: 'jour', quantity: 1, unit_price: 0, discount_pct: 0 })
}

function importFromProject() {
  const project = props.projects.find((p) => p.id === form.project_id)
  if (!project) return
  form.lines = project.tasks.map((task) => ({
    designation: task.title, unit: task.unit as Line['unit'],
    quantity: Number(task.quantity), unit_price: Number(task.unit_price), discount_pct: 0,
  }))
}

function addFromService(id: number) {
  const service = props.services.find((s) => s.id === id)
  if (!service) return
  const converted = form.currency === 'MAD'
    ? Number(service.unit_price_mad)
    : Math.round((Number(service.unit_price_mad) / form.exchange_rate_to_mad) * 100) / 100
  form.lines.push({
    designation: form.language === 'AR' ? service.title_ar : form.language === 'EN' ? service.title_en : service.title_fr,
    unit: service.unit as Line['unit'], quantity: 1, unit_price: converted, discount_pct: 0,
  })
}

function submit(issueNow: boolean) {
  form.issue_now = issueNow
  form.legal_mention = legalMention.value
  form.post(`/${org.slug}/documents`, {
    preserveScroll: true,
    onSuccess: () => { confirmOpen.value = false },
  })
}
</script>

<template>
  <Head title="Créer un document" />
  <div class="flex flex-1 flex-col lg:flex-row">
    <div class="flex-1 border-e border-[#E3E6EC] bg-white px-6 py-5 lg:max-w-[540px] lg:px-7 lg:py-6">
      <p class="text-[12px] text-[#667085]">Documents › <span class="font-semibold text-[#14171F]">Créer</span></p>

      <div class="mt-3 flex items-start justify-between gap-4">
        <div>
          <h1 class="text-[20px] font-bold tracking-[-0.02em] text-[#14171F]">Créer un document</h1>
          <p class="mt-0.5 text-[12.5px] text-[#667085]">Document conforme Auto-Entrepreneur avec aperçu A4 instantané.</p>
        </div>
        <button type="button" role="switch" :aria-checked="showPreview" class="flex shrink-0 items-center gap-2.5 rounded-[12px] border border-[#E3E6EC] bg-white px-3 py-2 text-[12px] font-medium" @click="showPreview = !showPreview">
          Aperçu A4
          <span class="relative inline-flex h-5 w-9 items-center rounded-full" :class="showPreview ? 'bg-[#2457F5]' : 'bg-[#D0D5DD]'">
            <span class="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform" :class="showPreview ? 'translate-x-4' : 'translate-x-1'" />
          </span>
        </button>
      </div>

      <div v-if="Object.keys(form.errors).length" role="alert" class="mt-3 rounded-[12px] border border-[#A31D1D]/30 bg-[#FDE3E3] px-3.5 py-2.5 text-[12px] text-[#A31D1D]">
        <p class="font-semibold">Veuillez corriger les champs signalés :</p>
        <ul class="mt-1 list-disc ps-5">
          <li v-for="(error, key) in form.errors" :key="key">{{ error }}</li>
        </ul>
      </div>

      <div role="tablist" class="mt-4 grid grid-cols-5 gap-1 rounded-[12px] bg-[#F3F4F6] p-1">
        <button v-for="tab in docTabs" :key="tab.key" type="button" role="tab" :aria-selected="form.type === tab.key" class="rounded-[9px] px-2 py-2 text-[11.5px]" :class="form.type === tab.key ? 'bg-white font-semibold text-[#14171F] shadow-sm' : 'text-[#667085]'" @click="form.type = tab.key">
          {{ tab.label }}
        </button>
      </div>

      <section class="mt-6 space-y-3.5">
        <h2 class="text-[14px] font-semibold text-[#14171F]">Informations</h2>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label class="block">
            <span class="text-[11px] font-medium text-[#525866]">Client *</span>
            <div class="mt-1 flex items-center gap-2 rounded-[12px] border border-[#2457F5] px-3 py-2.5">
              <CountryFlag :code="client?.country_code ?? 'MA'" :size="18" />
              <select :value="form.client_id ?? ''" class="w-full bg-transparent text-[13px] font-medium focus:outline-none" @change="selectClient(Number(($event.target as HTMLSelectElement).value))">
                <option v-for="option in clients" :key="option.id" :value="option.id">{{ option.name }}</option>
              </select>
            </div>
          </label>

          <label class="block">
            <span class="text-[11px] font-medium text-[#525866]">Projet / Mission (optionnel)</span>
            <select v-model="form.project_id" class="mt-1 w-full rounded-[12px] border border-[#E3E6EC] px-3 py-2.5 text-[12.5px] focus:border-[#2457F5] focus:outline-none">
              <option :value="null">Aucun projet lié</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">{{ project.code }} — {{ project.name }}</option>
            </select>
          </label>
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label class="block">
            <span class="text-[11px] font-medium text-[#525866]">Date d'émission *</span>
            <div class="mt-1 flex items-center gap-2 rounded-[12px] border border-[#E3E6EC] px-3 py-2">
              <Calendar class="h-4 w-4 text-[#667085]" />
              <input v-model="form.issue_date" type="date" class="w-full bg-transparent text-[13px] tabular focus:outline-none" />
            </div>
          </label>
          <label class="block">
            <span class="text-[11px] font-medium text-[#525866]">Date d'échéance *</span>
            <div class="mt-1 flex items-center gap-2 rounded-[12px] border border-[#E3E6EC] px-3 py-2" :class="form.errors.due_date ? 'border-[#A31D1D]' : ''">
              <Calendar class="h-4 w-4 text-[#667085]" />
              <input v-model="form.due_date" type="date" class="w-full bg-transparent text-[13px] tabular focus:outline-none" />
            </div>
            <span v-if="form.errors.due_date" class="mt-1 block text-[11.5px] font-medium text-[#A31D1D]">{{ form.errors.due_date }}</span>
          </label>
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-12">
          <div class="sm:col-span-7 rounded-[12px] border border-[#E3E6EC] bg-[#F3F4F6] px-3 py-2.5">
            <p class="text-[11px] text-[#525866]">Numéro séquentiel</p>
            <p class="mt-0.5 flex items-center gap-2 text-[12.5px] font-medium text-[#3F4654]">
              <Hash class="h-4 w-4 text-[#667085]" /> Attribué à l'émission
              <span class="ms-auto inline-flex items-center gap-1 rounded-md border border-[#E3E6EC] bg-white px-2 py-0.5 text-[11px] font-semibold tabular">
                <Lock class="h-3 w-3" /> {{ numberPreview }}
              </span>
            </p>
          </div>
          <div class="sm:col-span-5">
            <p class="text-[11px] font-medium text-[#525866]">Langue du PDF</p>
            <div class="mt-1 grid grid-cols-3 gap-1 rounded-[12px] border border-[#E3E6EC] p-1">
              <button v-for="lng in ['FR', 'EN', 'AR']" :key="lng" type="button" class="rounded-[8px] py-1 text-[11.5px] font-semibold" :class="form.language === lng ? 'bg-[#2457F5] text-white' : 'bg-[#F3F4F6] text-[#525866]'" @click="form.language = lng">
                {{ lng === 'AR' ? 'AR عربي' : lng }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-6 space-y-3.5 border-t border-[#ECEEF2] pt-5">
        <div class="flex items-center justify-between">
          <h2 class="text-[14px] font-semibold text-[#14171F]">Lignes de service</h2>
          <button type="button" class="inline-flex items-center gap-1.5 rounded-[10px] border border-[#E3E6EC] bg-[#F8F9FB] px-2.5 py-1.5 text-[11.5px] font-medium text-[#2457F5]" @click="importFromProject">
            <Sparkles class="h-3.5 w-3.5" /> Importer depuis le projet
          </button>
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-12">
          <label class="sm:col-span-7">
            <span class="text-[11px] font-medium text-[#525866]">Devise *</span>
            <div class="mt-1 flex items-center gap-2 rounded-[12px] border border-[#E3E6EC] px-3 py-2.5">
              <CountryFlag :code="currencies[form.currency]" :size="18" />
              <select :value="form.currency" class="w-full bg-transparent text-[13px] font-medium focus:outline-none" @change="selectCurrency(($event.target as HTMLSelectElement).value)">
                <option value="MAD">MAD — Dirham marocain</option>
                <option value="EUR">EUR — Euro (Zone SEPA)</option>
                <option value="CHF">CHF — Franc suisse</option>
                <option value="USD">USD — Dollar américain</option>
              </select>
            </div>
          </label>
          <label v-if="form.currency !== 'MAD'" class="sm:col-span-5">
            <span class="text-[11px] font-medium text-[#525866]">Taux indicatif (MAD)</span>
            <input v-model.number="form.exchange_rate_to_mad" type="number" step="0.05" class="mt-1 w-full rounded-[12px] border border-[#E3E6EC] px-3 py-2.5 text-[13px] font-semibold text-[#0F3D3A] tabular focus:outline-none" />
          </label>
        </div>

        <div class="space-y-3">
          <div v-for="(line, index) in form.lines" :key="index" class="rounded-[18px] border border-[#E3E6EC] p-4">
            <div class="flex items-center justify-between">
              <p class="text-[12.5px] font-semibold text-[#14171F]">
                Ligne {{ index + 1 }}
                <span class="ms-2 rounded-md bg-[#F3F4F6] px-2 py-0.5 text-[11px] tabular">
                  {{ money(line.quantity * line.unit_price * (1 - (line.discount_pct || 0) / 100), form.currency) }}
                </span>
              </p>
              <div class="flex items-center gap-1">
                <select aria-label="Insérer depuis le catalogue" class="rounded-[8px] border border-[#E3E6EC] bg-[#F8F9FB] px-2 py-1 text-[11px]" @change="addFromService(Number(($event.target as HTMLSelectElement).value)); ($event.target as HTMLSelectElement).value = ''">
                  <option value="">+ Catalogue</option>
                  <option v-for="service in services" :key="service.id" :value="service.id">{{ service.code }} — {{ service.title_fr }}</option>
                </select>
                <button type="button" class="rounded p-1.5 text-[#667085] hover:text-[#A31D1D]" :disabled="form.lines.length <= 1" @click="form.lines.splice(index, 1)"><Trash2 class="h-3.5 w-3.5" /></button>
                <ChevronUp class="h-3.5 w-3.5 text-[#98A2B3]" />
              </div>
            </div>

            <label class="mt-3 block">
              <span class="text-[11px] text-[#525866]">Désignation *</span>
              <input v-model="line.designation" type="text" placeholder="Ex : Conception Design System" class="mt-1 w-full rounded-[10px] border border-[#E3E6EC] px-3 py-2 text-[13px] focus:border-[#2457F5] focus:outline-none" />
              <span v-if="form.errors[`lines.${index}.designation`]" class="text-[11px] font-medium text-[#A31D1D]">{{ form.errors[`lines.${index}.designation`] }}</span>
            </label>

            <div class="mt-2 grid grid-cols-12 gap-2">
              <label class="col-span-3"><span class="text-[10.5px] text-[#525866]">Qté</span><input v-model.number="line.quantity" type="number" min="0.5" step="0.5" class="mt-1 w-full rounded-[10px] border border-[#E3E6EC] px-2 py-2 text-[12.5px] tabular" /></label>
              <label class="col-span-3"><span class="text-[10.5px] text-[#525866]">Unité</span>
                <select v-model="line.unit" class="mt-1 w-full rounded-[10px] border border-[#E3E6EC] px-2 py-2 text-[12px]">
                  <option value="jour">jour</option><option value="heure">heure</option><option value="forfait">forfait</option><option value="unité">unité</option>
                </select>
              </label>
              <label class="col-span-4"><span class="text-[10.5px] text-[#525866]">Prix unitaire ({{ form.currency }})</span><input v-model.number="line.unit_price" type="number" min="0" step="10" class="mt-1 w-full rounded-[10px] border border-[#E3E6EC] px-2 py-2 text-[12.5px] font-semibold tabular" /></label>
              <label class="col-span-2"><span class="text-[10.5px] text-[#525866]">Rem. %</span><input v-model.number="line.discount_pct" type="number" min="0" max="100" class="mt-1 w-full rounded-[10px] border border-[#E3E6EC] px-2 py-2 text-[12.5px] tabular" /></label>
            </div>
            <span v-if="form.errors[`lines.${index}.unit_price`]" class="mt-1 block text-[11px] font-medium text-[#A31D1D]">{{ form.errors[`lines.${index}.unit_price`] }}</span>
          </div>
        </div>

        <button type="button" class="flex w-full items-center justify-center gap-1.5 rounded-[12px] border border-[#E3E6EC] py-2.5 text-[12.5px] font-semibold text-[#14171F] hover:border-[#2457F5] hover:text-[#2457F5]" @click="addLine">
          <Plus class="h-4 w-4" /> Ajouter une ligne
        </button>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label class="flex items-center justify-between rounded-[12px] border border-[#E3E6EC] bg-[#F8F9FB] px-3 py-2.5 text-[12.5px] font-medium">
            Remise globale (%)
            <input v-model.number="form.global_discount_pct" type="number" min="0" max="90" class="w-16 rounded-[8px] border border-[#E3E6EC] px-2 py-1 text-end text-[12px] tabular" />
          </label>
          <label class="flex items-center justify-between rounded-[12px] border border-[#E3E6EC] bg-[#F8F9FB] px-3 py-2.5 text-[12.5px] font-medium">
            Acompte demandé (%)
            <input v-model.number="form.deposit_requested_pct" type="number" min="0" max="100" class="w-16 rounded-[8px] border border-[#E3E6EC] px-2 py-1 text-end text-[12px] tabular" />
          </label>
        </div>
      </section>

      <section class="mt-6 space-y-3.5 border-t border-[#ECEEF2] pt-5 pb-6">
        <h2 class="text-[14px] font-semibold text-[#14171F]">Mentions et paiement</h2>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label>
            <span class="text-[11px] text-[#525866]">Régime TVA</span>
            <select v-model="form.vat_regime" class="mt-1 w-full rounded-[12px] border border-[#E3E6EC] px-3 py-2.5 text-[12.5px]">
              <option value="franchise_ae">Franchise TVA — Art. 89-I-12° CGI</option>
              <option value="export_hors_champ">Export services — Art. 92-I-1° CGI</option>
            </select>
          </label>
          <label>
            <span class="text-[11px] text-[#525866]">Compte bancaire ({{ form.currency }})</span>
            <p class="mt-1 flex items-center justify-between rounded-[12px] border border-[#E3E6EC] px-3 py-2.5 text-[12px]">
              <span class="truncate font-medium">{{ bank?.bank_name }}</span>
              <span class="rounded bg-[#DDF5E6] px-1.5 py-0.5 text-[10px] font-semibold text-[#0B6B3A]">{{ form.currency === 'MAD' ? 'RIB' : 'IBAN+BIC' }}</span>
            </p>
          </label>
        </div>
        <label class="block">
          <span class="text-[11px] text-[#525866]">Mention légale auto-insérée</span>
          <textarea v-model="form.legal_mention" rows="2" :placeholder="legalMention" class="mt-1 w-full rounded-[12px] border border-[#E3E6EC] px-3 py-2 text-[11.5px] leading-relaxed" />
        </label>
        <label class="block">
          <span class="text-[11px] text-[#525866]">Notes pied de document</span>
          <input v-model="form.notes" type="text" class="mt-1 w-full rounded-[12px] border border-[#E3E6EC] px-3 py-2 text-[12px]" />
        </label>
      </section>
    </div>

    <div v-if="showPreview" class="flex flex-1 flex-col bg-[#F3F4F6]">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-[#E3E6EC] bg-white px-6 py-4">
        <div class="flex items-center gap-3">
          <h2 class="text-[17px] font-bold tracking-[-0.015em] text-[#14171F]">Aperçu</h2>
          <div class="inline-flex rounded-[10px] border border-[#E3E6EC] bg-[#F3F4F6] p-0.5">
            <button type="button" class="inline-flex items-center gap-1.5 rounded-[8px] px-2.5 py-1 text-[12px]" :class="previewMode === 'email' ? 'bg-white shadow-sm' : 'text-[#667085]'" @click="previewMode = 'email'"><Mail class="h-3.5 w-3.5" /> Email</button>
            <button type="button" class="inline-flex items-center gap-1.5 rounded-[8px] px-2.5 py-1 text-[12px]" :class="previewMode === 'pdf' ? 'bg-white shadow-sm' : 'text-[#667085]'" @click="previewMode = 'pdf'"><FileText class="h-3.5 w-3.5" /> PDF</button>
          </div>
          <span class="inline-flex items-center gap-1 rounded-md bg-[#EEF3FF] px-2 py-0.5 text-[10.5px] font-semibold text-[#1B45C9]"><Globe class="h-3 w-3" /> {{ form.language }}</span>
        </div>
        <div class="flex items-center gap-2.5">
          <button type="button" class="rounded-[12px] border border-[#E3E6EC] bg-white px-3.5 py-2 text-[12.5px] font-semibold" :disabled="form.processing" @click="submit(false)">Enregistrer le brouillon</button>
          <button type="button" class="inline-flex items-center gap-2 rounded-[12px] bg-[#2457F5] px-4 py-2 text-[12.5px] font-semibold text-white shadow-[0_6px_18px_rgba(36,87,245,0.24)] hover:bg-[#1B45C9]" :disabled="form.processing" @click="confirmOpen = true">
            <Send class="h-3.5 w-3.5" /> Émettre et envoyer
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-6 lg:p-8">
        <DocumentPaper
          :doc-type="form.type"
          :number="null"
          :language="form.language"
          :currency="form.currency"
          :rate-to-mad="form.exchange_rate_to_mad"
          :issue-date="form.issue_date"
          :due-date="form.due_date"
          :global-discount-pct="form.global_discount_pct"
          :deposit-pct="form.deposit_requested_pct"
          :lines="form.lines"
          :issuer="{ name: org.name, address: null, city: null, ice: org.ice, ae: org.auto_entrepreneur_number }"
          :client="{ name: client?.name ?? '', address: client?.city ?? null, city: client?.city ?? null, country_code: client?.country_code ?? 'MA', tax_id: client?.tax_id ?? null, tax_id_label: client?.tax_id_label }"
          :legal-mention="legalMention"
          :payment-method="form.payment_method"
          :payment-terms="form.payment_terms"
          :bank="bank"
          :notes="form.notes"
        />
        <p class="mt-3 text-center text-[11px] text-[#667085]">Aperçu en direct · {{ banksCount }} comptes bancaires configurés · {{ isRtlUi ? 'RTL' : 'LTR' }}</p>
      </div>
    </div>
  </div>

  <div v-if="confirmOpen" role="dialog" aria-modal="true" class="fixed inset-0 z-50 flex items-center justify-center bg-[#14171F]/45 p-4">
    <div class="w-full max-w-[460px] rounded-[20px] border border-[#E3E6EC] bg-white p-6 shadow-xl">
      <div class="flex items-start gap-3.5">
        <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#E4EBFF] text-[#2457F5]"><ShieldAlert class="h-5 w-5" /></span>
        <div>
          <h3 class="text-[16px] font-bold text-[#14171F]">Émettre verrouille le document et attribue le numéro</h3>
          <p class="mt-1.5 text-[13px] leading-relaxed text-[#525866]">Le numéro suivant sera attribué définitivement. Toute correction ultérieure devra passer par un avoir.</p>
        </div>
      </div>

      <div class="mt-4 space-y-2 rounded-[14px] border border-[#E3E6EC] bg-[#F8F9FB] p-4 text-[12.5px]">
        <div class="flex items-center justify-between"><span class="text-[#667085]">Numéro attribué</span><span class="inline-flex items-center gap-1.5 rounded-md bg-[#0F3D3A] px-2.5 py-1 text-[12px] font-bold text-[#BFF0D4] tabular"><Lock class="h-3 w-3" /> {{ numberPreview }}</span></div>
        <div class="flex items-center justify-between"><span class="text-[#667085]">Destinataire</span><span class="font-semibold text-[#14171F]">{{ client?.name }}</span></div>
        <div class="flex items-center justify-between"><span class="text-[#667085]">Langue du PDF</span><span class="font-semibold text-[#14171F]">{{ form.language }}</span></div>
      </div>

      <div class="mt-5 flex items-center justify-end gap-2.5">
        <button type="button" class="rounded-[12px] border border-[#E3E6EC] px-4 py-2.5 text-[13px] font-semibold text-[#3F4654]" @click="confirmOpen = false">Annuler</button>
        <button type="button" class="inline-flex items-center gap-2 rounded-[12px] bg-[#2457F5] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1B45C9]" :disabled="form.processing" @click="submit(true)">
          <Lock class="h-3.5 w-3.5" /> Confirmer et verrouiller
        </button>
      </div>
    </div>
  </div>
</template>
