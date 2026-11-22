<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Link, usePage } from '@inertiajs/vue3'
import {
  ChevronUp, FileText, FolderKanban, HelpCircle, LayoutDashboard, Moon, ReceiptText,
  Settings, Sun, Users, Wallet,
} from 'lucide-vue-next'
import type { OrganizationSummary } from '@/types'

const page = usePage<{
  auth: { user: { id: number; name: string; email: string } | null }
  organization: OrganizationSummary | null
  flash: { success?: string | null; error?: string | null }
}>()

const dark = ref(false)
watch(dark, (value) => {
  if (typeof document !== 'undefined') document.documentElement.classList.toggle('dark', value)
  if (typeof localStorage !== 'undefined') localStorage.setItem('facturo-theme', value ? 'dark' : 'light')
})

const org = computed(() => page.props.organization)
const user = computed(() => page.props.auth?.user)
const flash = computed(() => page.props.flash)
const current = computed(() => page.url)

const nav = computed(() => [
  { label: 'Tableau de bord', href: `/${org.value?.slug}`, icon: LayoutDashboard, active: page.component === 'Dashboard' },
  { label: 'Devis', href: `/${org.value?.slug}/documents?type=devis`, icon: FileText, active: current.value.includes('type=devis') },
  { label: 'Factures', href: `/${org.value?.slug}/documents?type=facture`, icon: ReceiptText, active: current.value.includes('type=facture') },
  { label: 'Clients', href: `/${org.value?.slug}/clients`, icon: Users, active: current.value.includes('/clients') },
  { label: 'Projets', href: `/${org.value?.slug}/projects`, icon: FolderKanban, active: current.value.includes('/projects') },
  { label: 'Paiements', href: `/${org.value?.slug}/payments`, icon: Wallet, active: current.value.includes('/payments') },
  { label: 'Déclarations', href: `/${org.value?.slug}/declarations`, icon: ReceiptText, active: current.value.includes('/declarations') },
])

const initials = computed(() =>
  (user.value?.name ?? 'Facturo')
    .replace(/\(.*?\)/g, '')
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join(''),
)
</script>

<template>
  <div class="flex min-h-screen w-full bg-white">
    <aside class="sticky top-0 hidden h-screen w-[236px] shrink-0 flex-col justify-between border-r border-[#E3E6EC] bg-white px-4 py-5 lg:flex">
      <div>
        <Link :href="`/${org?.slug}`" class="flex items-center gap-2.5 px-2">
          <span class="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#14171F] text-[17px] font-bold text-white">F</span>
          <span class="text-[18px] font-bold tracking-[-0.02em] text-[#14171F]">Facturo</span>
        </Link>

        <nav aria-label="Navigation principale" class="mt-6 space-y-0.5">
          <Link
            v-for="item in nav"
            :key="item.label"
            :href="item.href"
            :aria-current="item.active ? 'page' : undefined"
            class="flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[13px] transition-colors"
            :class="item.active
              ? 'bg-white font-semibold text-[#14171F] shadow-[0_1px_3px_rgba(20,23,31,0.10)]'
              : 'font-medium text-[#3F4654] hover:bg-[#F7F8FA] hover:text-[#14171F]'"
          >
            <component :is="item.icon" class="h-4 w-4" :class="item.active ? 'text-[#14171F]' : 'text-[#667085]'" :stroke-width="1.8" />
            {{ item.label }}
          </Link>
        </nav>
      </div>

      <div class="space-y-1">
        <a href="mailto:support@facturo.ma" class="flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[13px] font-medium text-[#3F4654] hover:bg-[#F7F8FA]">
          <HelpCircle class="h-4 w-4 text-[#667085]" :stroke-width="1.8" /> Aide et support
        </a>
        <Link :href="`/${org?.slug}/settings`" class="flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[13px] font-medium text-[#3F4654] hover:bg-[#F7F8FA]">
          <Settings class="h-4 w-4 text-[#667085]" :stroke-width="1.8" /> Paramètres
        </Link>

        <div class="flex items-center justify-between px-3 py-2.5">
          <span class="flex items-center gap-3 text-[13px] font-medium text-[#3F4654]">
            <component :is="dark ? Moon : Sun" class="h-4 w-4 text-[#667085]" :stroke-width="1.8" /> Mode sombre
          </span>
          <button
            type="button"
            role="switch"
            :aria-checked="dark"
            aria-label="Activer le mode sombre"
            class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
            :class="dark ? 'bg-[#2457F5]' : 'bg-[#E3E6EC]'"
            @click="dark = !dark"
          >
            <span class="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform" :class="dark ? 'translate-x-[18px]' : 'translate-x-[3px]'" />
          </button>
        </div>

        <div class="mt-3 flex items-center justify-between gap-2 rounded-[14px] border border-[#E3E6EC] px-3 py-2.5">
          <div class="flex min-w-0 items-center gap-2.5">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F3D3A] text-[11px] font-bold text-[#BFF0D4]">{{ initials }}</span>
            <div class="min-w-0">
              <p class="truncate text-[12px] font-semibold text-[#14171F]">{{ user?.name }}</p>
              <p class="truncate text-[10.5px] text-[#667085]">{{ user?.email }}</p>
            </div>
          </div>
          <ChevronUp class="h-3.5 w-3.5 shrink-0 text-[#98A2B3]" />
        </div>
      </div>
    </aside>

    <main class="flex min-w-0 flex-1 flex-col">
      <div class="flex items-center justify-between gap-2 border-b border-[#E3E6EC] px-4 py-3 lg:hidden">
        <span class="flex items-center gap-2">
          <span class="flex h-7 w-7 items-center justify-center rounded-full bg-[#14171F] text-[13px] font-bold text-white">F</span>
          <span class="text-[15px] font-bold text-[#14171F]">Facturo</span>
        </span>
        <Link :href="`/${org?.slug}/documents/create`" class="rounded-[10px] bg-[#2457F5] px-3 py-1.5 text-[12px] font-semibold text-white">+ Document</Link>
      </div>

      <div v-if="flash?.success" role="status" class="mx-6 mt-4 rounded-[12px] border border-[#0B6B3A]/20 bg-[#DDF5E6] px-4 py-2.5 text-[12.5px] font-medium text-[#0B6B3A]">
        {{ flash.success }}
      </div>
      <div v-if="flash?.error" role="alert" class="mx-6 mt-4 rounded-[12px] border border-[#A31D1D]/25 bg-[#FDE3E3] px-4 py-2.5 text-[12.5px] font-medium text-[#A31D1D]">
        {{ flash.error }}
      </div>

      <slot />
    </main>
  </div>
</template>
