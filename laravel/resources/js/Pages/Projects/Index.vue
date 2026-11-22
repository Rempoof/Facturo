<script setup lang="ts">
import { computed, ref } from 'vue'
import { Head, Link, router, usePage } from '@inertiajs/vue3'
import { CheckSquare, FilePlus2, Square } from 'lucide-vue-next'
import StatusBadge from '@/Components/StatusBadge.vue'
import { money } from '@/lib/utils'
import type { OrganizationSummary } from '@/types'

const props = defineProps<{ projects: any[]; clients: any[]; services: any[] }>()
const page = usePage<{ organization: OrganizationSummary }>()
const org = page.props.organization
const selectedId = ref<number | null>(props.projects[0]?.id ?? null)
const selected = computed(() => props.projects.find((p) => p.id === selectedId.value) ?? null)

function toggle(task: any) {
  router.patch(`/${org.slug}/projects/${selected.value.id}/tasks/${task.id}`, {}, { preserveScroll: true })
}
</script>

<template>
  <Head title="Projets" />
  <div class="flex-1 bg-white p-6 lg:p-8">
    <header>
      <p class="text-[12.5px] text-[#667085]">Missions, livrables & catalogue de prestations</p>
      <h1 class="mt-1 text-[26px] font-bold tracking-[-0.025em]">Projets / missions</h1>
    </header>

    <div class="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div class="space-y-3 lg:col-span-5">
        <button v-for="project in projects" :key="project.id" type="button" class="w-full rounded-[20px] border p-4 text-start" :class="selectedId === project.id ? 'border-[#2457F5] bg-white shadow-[0_10px_28px_rgba(36,87,245,0.08)]' : 'border-[#E3E6EC] hover:bg-[#F8F9FB]'" @click="selectedId = project.id">
          <p class="text-[11px] font-semibold text-[#525866] tabular">{{ project.code }}</p>
          <p class="mt-1 text-[14px] font-bold">{{ project.name }}</p>
          <p class="mt-1 text-[12px] text-[#667085]">{{ project.client?.name }}</p>
          <p class="mt-2 flex items-center justify-between border-t border-[#F0F2F5] pt-2 text-[12px]">
            <span>{{ project.tasks.filter((t: any) => t.completed_at).length }}/{{ project.tasks.length }} tâches livrées</span>
            <span class="font-bold tabular">{{ money(project.budget_amount, project.currency) }}</span>
          </p>
        </button>
        <p v-if="projects.length === 0" class="rounded-[20px] border border-[#E3E6EC] p-8 text-center text-[12.5px] text-[#667085]">Aucune mission pour le moment.</p>
      </div>

      <div v-if="selected" class="lg:col-span-7 space-y-5">
        <section class="rounded-[20px] border border-[#E3E6EC] p-6">
          <div class="flex flex-wrap items-start justify-between gap-4 border-b border-[#ECEEF2] pb-4">
            <div>
              <p class="text-[11.5px] font-semibold text-[#2457F5] tabular">{{ selected.code }} · échéance {{ selected.due_date }}</p>
              <h2 class="mt-1 text-[19px] font-bold">{{ selected.name }}</h2>
              <p class="mt-1 text-[13px] text-[#525866]">{{ selected.description }}</p>
            </div>
            <Link :href="`/${org.slug}/documents/create?type=devis&project_id=${selected.id}&client_id=${selected.client_id}`" class="inline-flex items-center gap-2 rounded-[12px] bg-[#2457F5] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1B45C9]">
              <FilePlus2 class="h-4 w-4" /> Créer un devis
            </Link>
          </div>

          <h3 class="mt-4 text-[14px] font-bold">Tâches & livrables (importables dans le devis)</h3>
          <div class="mt-3 space-y-2.5">
            <button v-for="task in selected.tasks" :key="task.id" type="button" class="flex w-full items-center justify-between gap-3 rounded-[14px] border border-[#E3E6EC] p-3.5 text-start hover:border-[#2457F5]" @click="toggle(task)">
              <span class="flex items-center gap-3">
                <CheckSquare v-if="task.completed_at" class="h-4 w-4 text-[#0B6B3A]" /><Square v-else class="h-4 w-4 text-[#98A2B3]" />
                <span>
                  <span class="block text-[13px] font-medium" :class="task.completed_at ? 'text-[#525866] line-through' : 'text-[#14171F]'">{{ task.title }}</span>
                  <span class="block text-[11px] text-[#667085] tabular">{{ task.quantity }} {{ task.unit }} × {{ money(task.unit_price, selected.currency) }}</span>
                </span>
              </span>
              <span class="text-[13px] font-bold tabular">{{ money(task.quantity * task.unit_price, selected.currency) }}</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
