<script setup lang="ts">
import { ref } from 'vue'
import { Head, Link, router, useForm, usePage } from '@inertiajs/vue3'
import { FilePlus2, Mail, MapPin, Plus, Search } from 'lucide-vue-next'
import CountryFlag from '@/Components/CountryFlag.vue'
import StatusBadge from '@/Components/StatusBadge.vue'
import { money } from '@/lib/utils'
import type { ClientSummary, OrganizationSummary } from '@/types'

const props = defineProps<{
  clients: ClientSummary[]
  selected: (ClientSummary & { documents: any[] }) | null
  filters: { search?: string }
}>()

const page = usePage<{ organization: OrganizationSummary }>()
const org = page.props.organization
const search = ref(props.filters.search ?? '')
const modal = ref(false)

const form = useForm({
  name: '', contact_name: '', type: 'company_ma', country_code: 'MA', city: '',
  address: '', email: '', tax_id: '', preferred_language: 'FR', default_currency: 'MAD', notes: '',
})

function submit() {
  form.post(`/${org.slug}/clients`, { preserveScroll: true, onSuccess: () => { modal.value = false; form.reset() } })
}

function filter() {
  router.get(`/${org.slug}/clients`, { search: search.value }, { preserveState: true, replace: true })
}
</script>

<template>
  <Head title="Clients" />
  <div class="flex-1 bg-white p-6 lg:p-8">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p class="text-[12.5px] text-[#667085]">Répertoire Maroc & international (ICE, TVA Intracom., UID, EIN)</p>
        <h1 class="mt-1 text-[26px] font-bold tracking-[-0.025em]">Clients & fiches de facturation</h1>
      </div>
      <button type="button" class="inline-flex items-center gap-2 rounded-[12px] bg-[#2457F5] px-4 py-2.5 text-[12.5px] font-semibold text-white hover:bg-[#1B45C9]" @click="modal = true">
        <Plus class="h-4 w-4" /> Nouveau client
      </button>
    </header>

    <div class="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div class="space-y-3 lg:col-span-5">
        <div class="relative">
          <Search class="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
          <input v-model="search" type="search" placeholder="Rechercher nom, ville, ICE…" class="w-full rounded-[12px] border border-[#E3E6EC] bg-[#F8F9FB] py-2.5 ps-9 pe-3 text-[12.5px]" @keyup.enter="filter" />
        </div>

        <Link
          v-for="client in clients"
          :key="client.id"
          :href="`/${org.slug}/clients?client_id=${client.id}`"
          class="block rounded-[16px] border p-3.5"
          :class="selected?.id === client.id ? 'border-[#2457F5] bg-[#E4EBFF]/35' : 'border-[#E3E6EC] hover:bg-[#F8F9FB]'"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <CountryFlag :code="client.country_code" :size="22" />
              <div>
                <p class="text-[13.5px] font-bold">{{ client.name }}</p>
                <p class="text-[11.5px] text-[#667085]">{{ client.city }}</p>
              </div>
            </div>
            <span class="rounded-md bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-bold">{{ client.default_currency }}</span>
          </div>
          <p class="mt-2.5 flex items-center justify-between text-[11px] text-[#525866] tabular">
            <span>{{ client.tax_id_label }} : {{ client.tax_id }}</span>
            <span class="font-semibold text-[#1B45C9]">PDF {{ client.preferred_language }}</span>
          </p>
        </Link>

        <div v-if="clients.length === 0" class="rounded-[20px] border border-[#E3E6EC] p-8 text-center">
          <p class="text-[14px] font-semibold">Aucun client enregistré</p>
          <p class="mt-1 text-[12.5px] text-[#667085]">Ajoutez un client marocain (ICE) ou export (EUR, CHF, USD).</p>
          <button type="button" class="mt-4 rounded-[12px] bg-[#2457F5] px-4 py-2 text-[12.5px] font-semibold text-white" @click="modal = true">Ajouter un premier client</button>
        </div>
      </div>

      <div v-if="selected" class="lg:col-span-7 space-y-5">
        <section class="rounded-[20px] border border-[#E3E6EC] p-6">
          <div class="flex flex-wrap items-start justify-between gap-4 border-b border-[#ECEEF2] pb-5">
            <div class="flex items-center gap-3.5">
              <CountryFlag :code="selected.country_code" :size="36" />
              <div>
                <h2 class="text-[19px] font-bold">{{ selected.name }}</h2>
                <p class="mt-0.5 text-[12.5px] text-[#667085]">{{ selected.contact_name }} · {{ selected.email }}</p>
              </div>
            </div>
            <Link :href="`/${org.slug}/documents/create?type=devis&client_id=${selected.id}`" class="inline-flex items-center gap-1.5 rounded-[12px] bg-[#0F3D3A] px-3.5 py-2 text-[12.5px] font-semibold text-[#BFF0D4]">
              <FilePlus2 class="h-4 w-4" /> Créer un devis
            </Link>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div class="rounded-[14px] bg-[#F8F9FB] p-3"><p class="text-[11px] text-[#667085]">Pays</p><p class="mt-1 text-[13px] font-semibold">{{ selected.country_code }}</p></div>
            <div class="rounded-[14px] bg-[#F8F9FB] p-3"><p class="text-[11px] text-[#667085]">{{ selected.tax_id_label }}</p><p class="mt-1 text-[12.5px] font-semibold tabular">{{ selected.tax_id }}</p></div>
            <div class="rounded-[14px] bg-[#F8F9FB] p-3"><p class="text-[11px] text-[#667085]">Langue</p><p class="mt-1 text-[13px] font-semibold">{{ selected.preferred_language }}</p></div>
            <div class="rounded-[14px] bg-[#F8F9FB] p-3"><p class="text-[11px] text-[#667085]">Devise</p><p class="mt-1 text-[13px] font-semibold">{{ selected.default_currency }}</p></div>
          </div>

          <p class="mt-4 flex items-center gap-1.5 text-[12.5px] text-[#525866]"><MapPin class="h-3.5 w-3.5" /> {{ selected.address ?? selected.city }}</p>
        </section>

        <section class="rounded-[20px] border border-[#E3E6EC] p-5">
          <h3 class="text-[14px] font-bold">Historique des documents ({{ selected.documents.length }})</h3>
          <table class="mt-3 w-full text-start text-[12.5px]">
            <thead class="text-[11px] text-[#667085]"><tr><th class="py-2 text-start">Numéro</th><th class="py-2 text-start">Date</th><th class="py-2 text-end">Montant</th><th class="py-2 text-start">Statut</th></tr></thead>
            <tbody class="divide-y divide-[#F0F2F5]">
              <tr v-for="doc in selected.documents" :key="doc.id">
                <td class="py-2.5"><Link :href="`/${org.slug}/documents/${doc.id}`" class="font-semibold text-[#2457F5] tabular">{{ doc.number ?? 'Brouillon' }}</Link></td>
                <td class="py-2.5 tabular text-[#667085]">{{ doc.issue_date }}</td>
                <td class="py-2.5 text-end font-semibold tabular">{{ money(doc.total_amount, doc.currency) }}</td>
                <td class="py-2.5"><StatusBadge :status="doc.status" /></td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>

    <div v-if="modal" role="dialog" aria-modal="true" class="fixed inset-0 z-50 flex items-center justify-center bg-[#14171F]/45 p-4">
      <form class="w-full max-w-[480px] space-y-3 rounded-[20px] border border-[#E3E6EC] bg-white p-6 shadow-xl" @submit.prevent="submit">
        <h3 class="text-[17px] font-bold">Ajouter un client</h3>
        <label class="block"><span class="text-[11px] text-[#525866]">Raison sociale *</span><input v-model="form.name" required class="mt-1 w-full rounded-[12px] border border-[#E3E6EC] px-3 py-2.5 text-[13px]" /></label>
        <div class="grid grid-cols-2 gap-3">
          <label><span class="text-[11px] text-[#525866]">Pays</span><select v-model="form.country_code" class="mt-1 w-full rounded-[12px] border border-[#E3E6EC] px-3 py-2.5 text-[13px]"><option>MA</option><option>FR</option><option>CH</option><option>US</option></select></label>
          <label><span class="text-[11px] text-[#525866]">Ville</span><input v-model="form.city" class="mt-1 w-full rounded-[12px] border border-[#E3E6EC] px-3 py-2.5 text-[13px]" /></label>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <label><span class="text-[11px] text-[#525866]">ICE / N° fiscal</span><input v-model="form.tax_id" class="mt-1 w-full rounded-[12px] border px-3 py-2.5 text-[13px] tabular" :class="form.errors.tax_id ? 'border-[#A31D1D]' : 'border-[#E3E6EC]'" /><span v-if="form.errors.tax_id" class="text-[11px] font-medium text-[#A31D1D]">{{ form.errors.tax_id }}</span></label>
          <label><span class="text-[11px] text-[#525866]">E-mail</span><input v-model="form.email" type="email" class="mt-1 w-full rounded-[12px] border border-[#E3E6EC] px-3 py-2.5 text-[13px]" /></label>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <label><span class="text-[11px] text-[#525866]">Devise</span><select v-model="form.default_currency" class="mt-1 w-full rounded-[12px] border px-3 py-2.5 text-[13px]"><option>MAD</option><option>EUR</option><option>CHF</option><option>USD</option></select></label>
          <label><span class="text-[11px] text-[#525866]">Langue PDF</span><select v-model="form.preferred_language" class="mt-1 w-full rounded-[12px] border px-3 py-2.5 text-[13px]"><option>FR</option><option>EN</option><option>AR</option></select></label>
        </div>
        <div class="flex justify-end gap-2.5 pt-2">
          <button type="button" class="rounded-[12px] border px-4 py-2 text-[13px] font-semibold" @click="modal = false">Annuler</button>
          <button type="submit" class="rounded-[12px] bg-[#2457F5] px-4 py-2 text-[13px] font-semibold text-white" :disabled="form.processing">Enregistrer</button>
        </div>
      </form>
    </div>
  </div>
</template>
