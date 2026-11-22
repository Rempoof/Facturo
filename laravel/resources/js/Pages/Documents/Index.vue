<script setup lang="ts">
import { ref, watch } from 'vue'
import { Head, Link, router, usePage } from '@inertiajs/vue3'
import { Banknote, Copy, Download, Eye, FileCheck2, FileMinus2, Plus, Search } from 'lucide-vue-next'
import CountryFlag from '@/Components/CountryFlag.vue'
import StatusBadge from '@/Components/StatusBadge.vue'
import { money } from '@/lib/utils'
import type { DocumentStatusCode, DocumentTypeCode, OrganizationSummary } from '@/types'

interface DocumentRow {
  id: number
  number: string | null
  type: DocumentTypeCode
  status: DocumentStatusCode
  is_locked: boolean
  language: string
  currency: string
  issue_date: string
  due_date: string
  total_amount: string
  indicative_mad_amount: string
  client: { id: number; name: string; country_code: string }
}

const props = defineProps<{
  documents: { data: DocumentRow[]; links: Array<{ url: string | null; label: string; active: boolean }> }
  clients: Array<{ id: number; name: string; country_code: string }>
  filters: Record<string, string | undefined>
}>()

const page = usePage<{ organization: OrganizationSummary }>()
const org = page.props.organization
const search = ref(props.filters.search ?? '')
const typeLabel: Record<string, string> = { devis: 'Devis', proforma: 'Proforma', facture: 'Facture', acompte: "Facture d'acompte", avoir: 'Avoir' }

let timer: number | undefined
watch(search, (value) => {
  window.clearTimeout(timer)
  timer = window.setTimeout(() => apply({ search: value }), 300)
})

function apply(next: Record<string, string | undefined>) {
  router.get(`/${org.slug}/documents`, { ...props.filters, ...next }, { preserveState: true, replace: true })
}

function convert(doc: DocumentRow, type: DocumentTypeCode) {
  router.post(`/${org.slug}/documents/${doc.id}/convert`, { type })
}
</script>

<template>
  <Head title="Documents" />
  <div class="flex-1 bg-white p-6 lg:p-8">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p class="text-[12.5px] text-[#667085]">Facturation & suivi · numérotation séquentielle verrouillée</p>
        <h1 class="mt-1 text-[26px] font-bold tracking-[-0.025em] text-[#14171F]">Documents commerciaux</h1>
      </div>
      <Link :href="`/${org.slug}/documents/create`" class="inline-flex items-center gap-2 rounded-[12px] bg-[#2457F5] px-4 py-2.5 text-[12.5px] font-semibold text-white hover:bg-[#1B45C9]">
        <Plus class="h-4 w-4" /> Nouveau document
      </Link>
    </header>

    <div class="mt-5 rounded-[20px] border border-[#E3E6EC] bg-white p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-1.5">
          <button
            v-for="tab in [{ k: '', l: 'Tous' }, { k: 'devis', l: 'Devis' }, { k: 'proforma', l: 'Proformas' }, { k: 'facture', l: 'Factures' }, { k: 'acompte', l: 'Acomptes' }, { k: 'avoir', l: 'Avoirs' }]"
            :key="tab.l"
            type="button"
            class="rounded-[10px] px-3 py-1.5 text-[12px] font-medium"
            :class="(filters.type ?? '') === tab.k ? 'bg-[#14171F] text-white' : 'bg-[#F3F4F6] text-[#525866] hover:text-[#14171F]'"
            @click="apply({ type: tab.k || undefined })"
          >
            {{ tab.l }}
          </button>
        </div>

        <div class="relative min-w-[240px] flex-1 sm:max-w-[300px]">
          <Search class="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
          <input
            v-model="search"
            type="search"
            placeholder="Rechercher N° FAC-2026, client…"
            class="w-full rounded-[12px] border border-[#E3E6EC] bg-[#F8F9FB] py-2 ps-9 pe-3 text-[12.5px] focus:border-[#2457F5] focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      <div class="mt-3 grid grid-cols-2 gap-2.5 border-t border-[#F0F2F5] pt-3 sm:grid-cols-4">
        <select :value="filters.status ?? ''" aria-label="Statut" class="rounded-[12px] border border-[#E3E6EC] px-3 py-2 text-[12px]" @change="apply({ status: ($event.target as HTMLSelectElement).value || undefined })">
          <option value="">Statut : tous</option>
          <option value="paid">Payée</option>
          <option value="accepted">Accepté</option>
          <option value="sent">Envoyée</option>
          <option value="pending">En attente</option>
          <option value="overdue">En retard</option>
          <option value="draft">Brouillon</option>
        </select>
        <select :value="filters.client_id ?? ''" aria-label="Client" class="rounded-[12px] border border-[#E3E6EC] px-3 py-2 text-[12px]" @change="apply({ client_id: ($event.target as HTMLSelectElement).value || undefined })">
          <option value="">Client : tous</option>
          <option v-for="client in clients" :key="client.id" :value="client.id">{{ client.name }}</option>
        </select>
        <select :value="filters.currency ?? ''" aria-label="Devise" class="rounded-[12px] border border-[#E3E6EC] px-3 py-2 text-[12px]" @change="apply({ currency: ($event.target as HTMLSelectElement).value || undefined })">
          <option value="">Devise : toutes</option>
          <option>MAD</option><option>EUR</option><option>CHF</option><option>USD</option>
        </select>
        <select :value="filters.period ?? ''" aria-label="Période" class="rounded-[12px] border border-[#E3E6EC] px-3 py-2 text-[12px]" @change="apply({ period: ($event.target as HTMLSelectElement).value || undefined })">
          <option value="">Période : année</option>
          <option value="quarter">Trimestre en cours</option>
          <option value="month">Ce mois</option>
        </select>
      </div>
    </div>

    <div class="mt-4 overflow-hidden rounded-[20px] border border-[#E3E6EC] bg-white">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-start">
          <thead>
            <tr class="border-b border-[#E3E6EC] bg-[#F7F8FA] text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
              <th class="px-5 py-3 text-start">Numéro & type</th>
              <th class="px-4 py-3 text-start">Client</th>
              <th class="px-4 py-3 text-start">Émission / échéance</th>
              <th class="px-4 py-3 text-start">Langue</th>
              <th class="px-4 py-3 text-end">Montant & MAD</th>
              <th class="px-4 py-3 text-start">Statut</th>
              <th class="px-5 py-3 text-end">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#F0F2F5] text-[12.5px]">
            <tr v-for="doc in documents.data" :key="doc.id" class="hover:bg-[#F8F9FB]">
              <td class="px-5 py-3.5">
                <Link :href="`/${org.slug}/documents/${doc.id}`" class="font-semibold text-[#14171F] hover:text-[#2457F5] tabular">
                  {{ doc.number ?? "Attribué à l'émission" }}
                </Link>
                <p class="text-[11px] text-[#667085]">{{ typeLabel[doc.type] }}</p>
              </td>
              <td class="px-4 py-3.5">
                <div class="flex items-center gap-2"><CountryFlag :code="doc.client.country_code" :size="18" />{{ doc.client.name }}</div>
              </td>
              <td class="px-4 py-3.5 tabular">
                <p class="font-medium text-[#14171F]">{{ doc.issue_date }}</p>
                <p class="text-[11px] text-[#667085]">Éch. {{ doc.due_date }}</p>
              </td>
              <td class="px-4 py-3.5">
                <span class="rounded-md border border-[#E3E6EC] bg-[#F8F9FB] px-2 py-0.5 text-[11px] font-semibold text-[#3F4654]">{{ doc.language === 'AR' ? 'AR (RTL)' : doc.language }}</span>
              </td>
              <td class="px-4 py-3.5 text-end tabular">
                <p class="font-bold text-[#14171F]">{{ money(doc.total_amount, doc.currency) }}</p>
                <p v-if="doc.currency !== 'MAD'" class="text-[11px] text-[#0F3D3A]">≈ {{ money(doc.indicative_mad_amount, 'MAD') }}</p>
              </td>
              <td class="px-4 py-3.5"><StatusBadge :status="doc.status" /></td>
              <td class="px-5 py-3.5">
                <div class="flex items-center justify-end gap-1">
                  <Link :href="`/${org.slug}/documents/${doc.id}`" title="Voir" class="rounded-[9px] border border-[#E3E6EC] p-1.5 text-[#3F4654] hover:border-[#2457F5] hover:text-[#2457F5]"><Eye class="h-3.5 w-3.5" /></Link>
                  <button type="button" title="Dupliquer" class="rounded-[9px] border border-[#E3E6EC] p-1.5 text-[#3F4654] hover:border-[#2457F5]" @click="convert(doc, doc.type)"><Copy class="h-3.5 w-3.5" /></button>
                  <button v-if="['devis', 'proforma'].includes(doc.type)" type="button" class="inline-flex items-center gap-1 rounded-[9px] border border-[#E3E6EC] bg-[#F8F9FB] px-2 py-1 text-[11px] font-semibold text-[#1B45C9]" @click="convert(doc, 'facture')">
                    <FileCheck2 class="h-3.5 w-3.5" /> Facturer
                  </button>
                  <button v-if="doc.type === 'facture' && doc.is_locked" type="button" title="Créer un avoir" class="rounded-[9px] border border-[#E3E6EC] p-1.5 text-[#3F4654] hover:border-[#A31D1D] hover:text-[#A31D1D]" @click="convert(doc, 'avoir')"><FileMinus2 class="h-3.5 w-3.5" /></button>
                  <a :href="`/${org.slug}/documents/${doc.id}/pdf`" target="_blank" title="PDF" class="rounded-[9px] border border-[#E3E6EC] p-1.5 text-[#3F4654] hover:border-[#14171F]"><Download class="h-3.5 w-3.5" /></a>
                  <Link v-if="doc.is_locked && doc.status !== 'paid' && ['facture', 'acompte'].includes(doc.type)" :href="`/${org.slug}/documents/${doc.id}?pay=1`" class="inline-flex items-center gap-1 rounded-[9px] bg-[#0F3D3A] px-2.5 py-1.5 text-[11px] font-semibold text-[#BFF0D4]">
                    <Banknote class="h-3.5 w-3.5" /> Paiement
                  </Link>
                </div>
              </td>
            </tr>
            <tr v-if="documents.data.length === 0">
              <td colspan="7" class="px-5 py-12 text-center">
                <p class="text-[14px] font-semibold text-[#14171F]">Aucun document pour le moment</p>
                <p class="mt-1 text-[12.5px] text-[#667085]">Créez un devis, une proforma ou votre première facture en FR, EN ou AR.</p>
                <Link :href="`/${org.slug}/documents/create`" class="mt-4 inline-flex rounded-[12px] bg-[#0F3D3A] px-4 py-2 text-[12.5px] font-semibold text-[#BFF0D4]">Créer mon premier document</Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
