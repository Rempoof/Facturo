<script setup lang="ts">
import { computed } from 'vue'
import type { CeilingPayload } from '@/types'
import { money } from '@/lib/utils'

const props = defineProps<{ ceiling: CeilingPayload }>()
const clamped = computed(() => Math.min(100, Math.max(0, props.ceiling.percent)))
</script>

<template>
  <section class="rounded-[20px] bg-[#0F3D3A] p-6 text-white">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <p class="text-[12.5px] text-[#D6EFE1]">
        Chiffre d'affaires encaissé en {{ new Date().getFullYear() }} · activité de {{ ceiling.activity_label }}
      </p>
      <span class="rounded-full bg-[#FCE7B6] px-3 py-1 text-[11.5px] font-bold text-[#7A3E00]">
        {{ Math.round(ceiling.percent) }} % · {{ ceiling.zone.label }}
      </span>
    </div>

    <p class="mt-3 flex items-baseline gap-2">
      <span class="text-[38px] font-bold leading-none tracking-[-0.03em] tabular">{{ money(ceiling.collected_mad, '', false).trim() }}</span>
      <span class="text-[18px] font-semibold text-[#D6EFE1]">MAD</span>
    </p>

    <div class="relative mt-5 h-2.5 w-full overflow-hidden rounded-full bg-white/15">
      <div class="absolute inset-y-0 left-0 w-[60%] bg-[#34D399]/45" />
      <div class="absolute inset-y-0 left-[60%] w-[25%] bg-[#F5B544]/45" />
      <div class="absolute inset-y-0 left-[85%] w-[15%] bg-[#F87171]/50" />
      <div class="absolute inset-y-0 left-0 rounded-full bg-[#EAFBF1]" :style="{ width: Math.max(2, clamped) + '%' }" />
      <div class="absolute inset-y-0 left-[60%] w-px bg-[#0F3D3A]/35" />
      <div class="absolute inset-y-0 left-[85%] w-px bg-[#0F3D3A]/35" />
    </div>

    <div class="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[11.5px] text-[#D6EFE1]">
      <span class="inline-flex items-center gap-1.5"><i class="h-2 w-2 rounded-full bg-[#34D399]" /> Sûr · 0–60 %</span>
      <span class="inline-flex items-center gap-1.5"><i class="h-2 w-2 rounded-full bg-[#F5B544]" /> Vigilance · 60–85 %</span>
      <span class="inline-flex items-center gap-1.5"><i class="h-2 w-2 rounded-full bg-[#F87171]" /> Limite · 85 % et plus</span>
    </div>

    <div class="mt-3 flex flex-wrap items-center justify-between gap-2 text-[12px]">
      <span class="font-semibold">Reste {{ money(ceiling.remaining_mad) }} avant le plafond</span>
      <span class="text-[#D6EFE1] underline decoration-[#D6EFE1]/40 underline-offset-4">
        Plafond configuré · {{ money(ceiling.ceiling_mad) }} (modifiable)
      </span>
    </div>

    <p class="mt-5 rounded-[12px] bg-white/10 px-4 py-3 text-[12.5px] leading-relaxed text-[#EAFBF1]">
      Au rythme actuel (≈ {{ money(ceiling.run_rate_mad) }}/mois), le plafond serait atteint vers
      {{ ceiling.projection ?? 'une date à confirmer' }}. Les factures à encaisser ci-dessous ne comptent qu'une fois payées.
    </p>
  </section>
</template>
