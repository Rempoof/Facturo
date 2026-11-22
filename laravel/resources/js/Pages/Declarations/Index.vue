<script setup lang="ts">
import { Head, Link, usePage } from '@inertiajs/vue3'
import { CalendarClock, FileSpreadsheet } from 'lucide-vue-next'
import { amountOnly, money } from '@/lib/utils'
import type { OrganizationSummary } from '@/types'

const props = defineProps<{
  declaration: { label: string; period_start: string; total_mad: number; rate_hint: number }
  quarters: Array<{ quarter: number; label: string; total_mad: number; deadline: string }>
  ceiling: { collected_mad: number; ceiling_mad: number; percent: number }
  activityCategory: string
}>()

const page = usePage<{ organization: OrganizationSummary }>()
const org = page.props.organization
</script>

<template>
  <Head title="Déclarations" />
  <div class="flex-1 bg-white p-6 lg:p-8">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p class="text-[12.5px] text-[#667085]">Chiffre d'affaires encaissé · régime Auto-Entrepreneur</p>
        <h1 class="mt-1 text-[26px] font-bold tracking-[-0.025em]">Déclarations</h1>
      </div>
      <Link :href="`/${org.slug}/settings`" class="rounded-[12px] border border-[#E3E6EC] px-4 py-2.5 text-[12.5px] font-semibold hover:bg-[#F8F9FB]">Configurer le taux</Link>
    </header>

    <div class="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12">
      <section class="rounded-[20px] bg-[#0F3D3A] p-6 text-white lg:col-span-5">
        <p class="text-[12.5px] text-[#D6EFE1]">Chiffre d'affaires {{ new Date().getFullYear() }} encaissé</p>
        <p class="mt-2 text-[32px] font-bold leading-none tabular">{{ amountOnly(ceiling.collected_mad) }} <span class="text-[16px]">MAD</span></p>
        <p class="mt-2 text-[12px] text-[#D6EFE1]">Plafond {{ amountOnly(ceiling.ceiling_mad) }} MAD · taux indicatif {{ declaration.rate_hint }} %</p>
        <div class="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/15">
          <div class="h-full rounded-full bg-[#BFF0D4]" :style="{ width: Math.min(100, ceiling.percent) + '%' }" />
        </div>
        <p class="mt-5 rounded-[12px] bg-white/10 px-4 py-3 text-[12.5px] leading-relaxed">
          {{ declaration.label }} : {{ money(declaration.total_mad) }} encaissés depuis le {{ declaration.period_start }}.<br>
          Contribution estimée : [taux à configurer] · Échéance : [date à configurer]
        </p>
      </section>

      <section class="rounded-[20px] border border-[#E3E6EC] p-5 lg:col-span-7">
        <div class="flex items-center justify-between">
          <h2 class="text-[16px] font-bold">Rythme trimestriel</h2>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-[#F8F9FB] px-2.5 py-1 text-[11.5px] text-[#525866]"><CalendarClock class="h-3.5 w-3.5" /> Déclaration en ligne</span>
        </div>
        <div class="mt-4 divide-y divide-[#F0F2F5]">
          <div v-for="quarter in quarters" :key="quarter.quarter" class="flex items-center justify-between py-3.5">
            <div class="flex items-center gap-3">
              <span class="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#F7F8FA] text-[12.5px] font-bold">{{ quarter.label }}</span>
              <p class="text-[11.5px] text-[#667085] tabular">Échéance indicative {{ quarter.deadline }}</p>
            </div>
            <span class="text-[13px] font-bold tabular">{{ amountOnly(quarter.total_mad) }} MAD</span>
          </div>
        </div>
        <p class="mt-4 flex items-center gap-2 rounded-[12px] bg-[#F7F8FA] px-4 py-3 text-[11.5px] text-[#525866]"><FileSpreadsheet class="h-4 w-4 text-[#0F3D3A]" /> Export détaillé par devise et par client avant dépôt.</p>
      </section>
    </div>
  </div>
</template>
