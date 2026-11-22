<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle, CheckCircle2, Clock, FileCheck2, FileEdit, Send } from 'lucide-vue-next'
import type { DocumentStatusCode } from '@/types'

const props = defineProps<{ status: DocumentStatusCode | string }>()

const map = {
  paid: { bg: '#DDF5E6', fg: '#0B6B3A', label: 'Payée', icon: CheckCircle2 },
  accepted: { bg: '#DDF5E6', fg: '#0B6B3A', label: 'Accepté', icon: FileCheck2 },
  sent: { bg: '#E4EBFF', fg: '#1B45C9', label: 'Envoyée', icon: Send },
  pending: { bg: '#FFF0D6', fg: '#8A4B00', label: 'En attente', icon: Clock },
  overdue: { bg: '#FDE3E3', fg: '#A31D1D', label: 'En retard', icon: AlertTriangle },
  draft: { bg: '#E8EAEE', fg: '#3F4654', label: 'Brouillon', icon: FileEdit },
} as const

const config = computed(() => map[(props.status as keyof typeof map)] ?? map.draft)
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium leading-none whitespace-nowrap"
    :style="{ backgroundColor: config.bg, color: config.fg }"
  >
    <component :is="config.icon" class="h-3.5 w-3.5 shrink-0" :stroke-width="2" />
    {{ config.label }}
  </span>
</template>
