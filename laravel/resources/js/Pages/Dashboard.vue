<script setup lang="ts">
import { computed, ref } from 'vue'
import { Head, Link, router, usePage } from '@inertiajs/vue3'
import { CheckCircle2, ChevronRight, TrendingUp, X } from 'lucide-vue-next'
import CeilingGauge from '@/Components/CeilingGauge.vue'
import CountryFlag from '@/Components/CountryFlag.vue'
import { amountOnly, money } from '@/lib/utils'
import type { DashboardPayload, OrganizationSummary } from '@/types'

const props = defineProps<{ dashboard: DashboardPayload; today: string; numberPreviews: Record<string, string> }>()

const page = usePage<{ organization: OrganizationSummary; auth: { user: { name: string } } }>()
const org = computed(() => page.props.organization)
const firstName = computed(() => (page.props.auth?.user?.name ?? '').replace(/\(.*?\)/g, '').trim().split(' ')[0])
const toast = ref<string | null>(null)

const cycleCards = computed(() => [
  { label: 'Devis envoyés', ...props.dashboard.cycle.quotes_sent, mint: false },
  { label: 'Acceptés', ...props.dashboard.cycle.accepted, mint: false },
  { label: 'Factures émises', ...props.dashboard.cycle.invoiced, mint: false },
  { label: 'Payées ce mois', ...props.dashboard.cycle.paid_month, mint: true, suffix: ' reçus' },
])

const dotColor = (tone: string) => ({ red: '#E5534B', blue: '#2457F5', amber: '#F0A32A', green: '#12A05C' }[tone] ?? '#98A2B3')
const maxMonthly = computed(() => Math.max(...props.dashboard.monthly.map((m) => m.total_mad), 1))
const originColors: Record<string, string> = { USD: '#2457F5', MAD: '#0F3D3A', CHF: '#BFF0D4', EUR: '#8A4B00' }

function notify(message: string) {
  toast.value = message
  window.setTimeout(() => (toast.value = null), 4000)
}

function act(action: DashboardPayload['actions'][number]) {
  if (action.kind === 'convert' && action.document_id) {
    router.post(`/${org.value.slug}/documents/${action.document_id}/convert`, { type: 'facture' }, { preserveScroll: true })
    return
  }
  if (action.kind === 'record_payment' && action.document_id) {
    router.visit(`/${org.value.slug}/documents/${action.document_id}?pay=1`)
    return
  }
  if (action.kind === 'invoice_project') {
    router.visit(`/${org.value.slug}/documents/create?type=facture&project_id=${action.project_id}`)
    return
  }
  notify('Relance préparée : l’e-mail de rappel part à la prochaine file d’envoi.')
}
</script>

<template>
  <Head title="Tableau de bord" />

  <div class="flex-1 bg-white px-6 py-6 lg:px-8 lg:py-7">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p class="text-[12.5px] text-[#667085]">{{ today.charAt(0).toUpperCase() + today.slice(1) }}</p>
        <h1 class="mt-1.5 text-[26px] font-bold leading-tight tracking-[-0.025em] text-[#14171F] lg:text-[28px]">
          Bonjour {{ firstName }}, voici ce qui compte aujourd'hui
        </h1>
      </div>
      <div class="flex flex-wrap items-center gap-2.5">
        <span class="inline-flex items-center rounded-[9px] bg-[#FFF0D6] px-3 py-1.5 text-[12px] font-semibold text-[#8A4B00]">Données d'exemple</span>
        <Link :href="`/${org.slug}/documents/create?type=devis`" class="rounded-[12px] border border-[#E3E6EC] bg-white px-4 py-2.5 text-[12.5px] font-semibold text-[#14171F] hover:bg-[#F8F9FB]">
          Nouveau devis
        </Link>
        <Link :href="`/${org.slug}/documents/create?type=facture`" class="rounded-[12px] bg-[#2457F5] px-4 py-2.5 text-[12.5px] font-semibold text-white hover:bg-[#1B45C9]">
          Nouvelle facture
        </Link>
      </div>
    </header>

    <div class="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div class="lg:col-span-8"><CeilingGauge :ceiling="dashboard.ceiling" /></div>

      <div class="flex flex-col gap-4 lg:col-span-4">
        <section class="flex-1 rounded-[20px] border border-[#E3E6EC] bg-white p-5">
          <p class="text-[12.5px] font-medium text-[#525866]">À encaisser</p>
          <p class="mt-1.5 text-[26px] font-bold leading-none tracking-[-0.02em] text-[#14171F] tabular">
            {{ amountOnly(dashboard.cashflow.to_collect_mad) }} <span class="text-[15px]">MAD</span>
          </p>
          <p class="mt-2 text-[12px] text-[#667085]">
            {{ dashboard.cashflow.to_collect_count }} facture{{ dashboard.cashflow.to_collect_count > 1 ? 's' : '' }}
            <template v-if="dashboard.cashflow.overdue_count > 0">
              · <span class="font-semibold text-[#A31D1D]">dont {{ dashboard.cashflow.overdue_count }} en retard</span>
            </template>
          </p>
        </section>

        <section class="flex-1 rounded-[20px] border border-[#E3E6EC] bg-white p-5">
          <p class="text-[12.5px] font-medium text-[#525866]">À facturer</p>
          <p class="mt-1.5 text-[26px] font-bold leading-none tracking-[-0.02em] text-[#14171F] tabular">
            {{ amountOnly(dashboard.cashflow.to_invoice_mad) }} <span class="text-[15px]">MAD</span>
          </p>
          <p class="mt-2 text-[12px] text-[#667085]">
            {{ dashboard.cashflow.accepted_count }} devis accepté{{ dashboard.cashflow.accepted_count > 1 ? 's' : '' }}
            + {{ dashboard.cashflow.unbilled_tasks_count }} tâche{{ dashboard.cashflow.unbilled_tasks_count > 1 ? 's' : '' }} non facturée{{ dashboard.cashflow.unbilled_tasks_count > 1 ? 's' : '' }}
          </p>
        </section>
      </div>
    </div>

    <section class="mt-4 rounded-[20px] border border-[#E3E6EC] bg-white p-5 lg:p-6">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-[16px] font-bold text-[#14171F]">Votre cycle de facturation</h2>
        <span class="text-[12px] text-[#667085]">Du devis au paiement reçu</span>
      </div>
      <div class="mt-4 grid grid-cols-1 items-stretch gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
        <template v-for="(card, index) in cycleCards" :key="card.label">
          <div class="rounded-[14px] px-4 py-3" :class="card.mint ? 'bg-[#E7F7EE]' : 'bg-[#F7F8FA]'">
            <p class="text-[12px]" :class="card.mint ? 'text-[#0B6B3A]' : 'text-[#667085]'">{{ card.label }}</p>
            <p class="mt-1 text-[20px] font-bold leading-none tabular" :class="card.mint ? 'text-[#0B6B3A]' : 'text-[#14171F]'">{{ card.count }}</p>
            <p class="mt-1.5 text-[11.5px] tabular" :class="card.mint ? 'text-[#0B6B3A]' : 'text-[#525866]'">
              {{ amountOnly(card.amount_mad) }} MAD{{ card.suffix ?? '' }}
            </p>
          </div>
          <div v-if="index < cycleCards.length - 1" class="hidden items-center justify-center text-[#98A2B3] lg:flex">
            <ChevronRight class="h-4 w-4" :stroke-width="2" />
          </div>
        </template>
      </div>
    </section>

    <div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
      <section class="rounded-[20px] border border-[#E3E6EC] bg-white p-5 lg:col-span-8 lg:p-6">
        <div class="flex items-center justify-between gap-2">
          <h2 class="text-[16px] font-bold text-[#14171F]">À faire maintenant</h2>
          <span class="rounded-full bg-[#FDE3E3] px-2.5 py-1 text-[11.5px] font-semibold text-[#A31D1D]">
            {{ dashboard.actions.length }} action{{ dashboard.actions.length > 1 ? 's' : '' }}
          </span>
        </div>

        <ul class="mt-2 divide-y divide-[#F0F2F5]">
          <li v-for="action in dashboard.actions" :key="action.id" class="flex flex-wrap items-center justify-between gap-3 py-3.5">
            <div class="flex min-w-0 items-start gap-3">
              <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full" :style="{ backgroundColor: dotColor(action.tone) }" />
              <div class="min-w-0">
                <p class="truncate text-[13px] font-bold text-[#14171F]">{{ action.title }}</p>
                <p class="mt-0.5 text-[11.5px] text-[#667085]">{{ action.meta }}</p>
              </div>
            </div>
            <button
              type="button"
              class="shrink-0 rounded-[10px] px-3.5 py-2 text-[12px] font-semibold transition-colors"
              :class="action.primary ? 'bg-[#2457F5] text-white hover:bg-[#1B45C9]' : 'border border-[#E3E6EC] bg-[#F7F8FA] text-[#14171F] hover:bg-[#EFF1F4]'"
              @click="act(action)"
            >
              {{ action.cta }}
            </button>
          </li>
          <li v-if="dashboard.actions.length === 0" class="py-8 text-center text-[12.5px] text-[#667085]">Rien à faire : tout est à jour.</li>
        </ul>
      </section>

      <div class="flex flex-col gap-4 lg:col-span-4">
        <section class="rounded-[20px] border border-[#E3E6EC] bg-white p-5">
          <h2 class="text-[16px] font-bold text-[#14171F]">Déclaration du chiffre d'affaires</h2>
          <p class="mt-0.5 text-[12px] text-[#667085]">{{ dashboard.declaration.label }} · rythme trimestriel</p>
          <p class="mt-2 text-[26px] font-bold leading-none tracking-[-0.02em] text-[#14171F] tabular">
            {{ amountOnly(dashboard.declaration.total_mad) }} <span class="text-[15px]">MAD</span>
          </p>
          <p class="mt-1 text-[12px] text-[#667085]">encaissés depuis le {{ dashboard.declaration.period_start }}, à déclarer</p>

          <div class="mt-3 rounded-[12px] bg-[#F7F8FA] px-3.5 py-3 text-[12px] leading-relaxed text-[#525866]">
            Contribution estimée : {{ dashboard.declaration.contribution_mad === null ? '[taux à configurer]' : money(dashboard.declaration.contribution_mad) }}<br>
            Échéance : {{ dashboard.declaration.deadline ?? '[date à configurer]' }}
          </div>

          <Link :href="`/${org.slug}/declarations`" class="mt-3 block rounded-[10px] bg-[#2457F5] py-2.5 text-center text-[12.5px] font-semibold text-white hover:bg-[#1B45C9]">
            Préparer ma déclaration
          </Link>
        </section>

        <section class="rounded-[20px] border border-[#E3E6EC] bg-white p-5">
          <h2 class="text-[16px] font-bold text-[#14171F]">Prochaines échéances</h2>
          <ul class="mt-3 space-y-3">
            <li v-for="deadline in dashboard.deadlines" :key="deadline.document_id" class="flex items-start gap-3">
              <div class="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[10px] bg-[#F7F8FA]">
                <span class="text-[13px] font-bold leading-none tabular">{{ deadline.day }}</span>
                <span class="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#667085]">{{ deadline.month }}</span>
              </div>
              <div class="min-w-0 flex-1">
                <Link :href="`/${org.slug}/documents/${deadline.document_id}`" class="truncate text-[12.5px] font-semibold text-[#14171F] hover:text-[#2457F5]">
                  {{ deadline.title }}
                </Link>
                <p class="text-[11.5px] text-[#667085]">{{ deadline.client }}</p>
              </div>
            </li>
            <li v-if="dashboard.deadlines.length === 0" class="text-[12.5px] text-[#667085]">Aucune échéance à venir.</li>
          </ul>
        </section>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-1 gap-4 pb-2 lg:grid-cols-12">
      <section class="rounded-[20px] border border-[#E3E6EC] bg-white p-5 lg:col-span-8 lg:p-6">
        <div class="flex items-center justify-between gap-2">
          <h2 class="text-[16px] font-bold text-[#14171F]">Encaissements par mois</h2>
          <span class="text-[12px] text-[#667085]">MAD reçus</span>
        </div>
        <div class="mt-5 flex h-[180px] items-end justify-between gap-4 border-b border-[#ECEEF2] pb-2">
          <div v-for="month in dashboard.monthly" :key="month.key" class="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <span class="text-[10.5px] font-semibold text-[#525866] tabular">{{ month.total_mad > 0 ? Math.round(month.total_mad / 1000) + 'k' : '' }}</span>
            <div
              class="w-full max-w-[56px] rounded-t-[8px]"
              :class="month.current ? 'bg-[#2457F5]' : 'bg-[#DCE3FF]'"
              :style="{ height: Math.max(6, (month.total_mad / maxMonthly) * 140) + 'px' }"
              :title="money(month.total_mad)"
            />
          </div>
        </div>
        <div class="mt-2 flex justify-between gap-4">
          <span v-for="month in dashboard.monthly" :key="month.key" class="flex-1 text-center text-[11.5px] text-[#667085]">{{ month.label }}</span>
        </div>
      </section>

      <section class="rounded-[20px] border border-[#E3E6EC] bg-white p-5 lg:col-span-4">
        <h2 class="text-[16px] font-bold text-[#14171F]">Origine des encaissements</h2>
        <p class="mt-0.5 text-[12px] text-[#667085]">Par devise, converti en MAD reçus</p>
        <div class="mt-4 space-y-4">
          <div v-for="row in dashboard.origin" :key="row.currency">
            <div class="flex items-center justify-between text-[12.5px]">
              <span class="flex items-center gap-2 font-semibold text-[#14171F]"><CountryFlag :code="row.currency" :size="16" /> {{ row.currency }}</span>
              <span class="font-semibold tabular">{{ row.percent }} %</span>
            </div>
            <div class="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#EFF1F4]">
              <div class="h-full rounded-full" :style="{ width: row.percent + '%', backgroundColor: originColors[row.currency] ?? '#98A2B3' }" />
            </div>
          </div>
          <p v-if="dashboard.origin.length === 0" class="text-[12.5px] text-[#667085]">Aucun encaissement pour le moment.</p>
        </div>
        <div class="mt-5 flex items-start gap-2 rounded-[12px] bg-[#F7F8FA] px-3.5 py-3 text-[11.5px] leading-relaxed text-[#525866]">
          <TrendingUp class="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0F3D3A]" />
          Seuls les montants reçus en MAD comptent dans votre plafond Auto-Entrepreneur.
        </div>
      </section>
    </div>

    <div v-if="toast" role="status" class="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-[14px] border border-[#E3E6EC] bg-white px-4 py-3 shadow-[0_20px_48px_rgba(20,23,31,0.16)]">
      <CheckCircle2 class="h-4 w-4 text-[#0B6B3A]" />
      <span class="text-[12.5px] font-medium text-[#14171F]">{{ toast }}</span>
      <button type="button" class="rounded p-1 text-[#667085] hover:bg-[#F3F4F6]" aria-label="Fermer" @click="toast = null"><X class="h-3.5 w-3.5" /></button>
    </div>
  </div>
</template>
