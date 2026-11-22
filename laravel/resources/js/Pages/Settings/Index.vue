<script setup lang="ts">
import { Head, useForm, usePage } from '@inertiajs/vue3'
import { Building2, Hash, Landmark, Lock, ShieldCheck } from 'lucide-vue-next'
import CountryFlag from '@/Components/CountryFlag.vue'
import type { OrganizationSummary } from '@/types'

const props = defineProps<{ organization: any; sequences: any[]; plans: Record<string, any>; subscription: any }>()
const page = usePage<{ organization: OrganizationSummary }>()

const form = useForm({
  name: props.organization.name,
  ice: props.organization.ice ?? '',
  auto_entrepreneur_number: props.organization.auto_entrepreneur_number ?? '',
  identifiant_fiscal: props.organization.identifiant_fiscal ?? '',
  taxe_professionnelle: props.organization.taxe_professionnelle ?? '',
  activity_category: props.organization.activity_category,
  annual_ceiling_mad: Number(props.organization.annual_ceiling_mad),
  address: props.organization.address ?? '',
  city: props.organization.city ?? '',
  email: props.organization.email ?? '',
  bank_accounts: props.organization.bank_accounts ?? [],
  legal_mentions: props.organization.legal_mentions ?? {},
})

const banks: any[] = props.organization.bank_accounts ?? []

function submit() {
  form.put(`/${page.props.organization.slug}/settings`, { preserveScroll: true })
}
</script>

<template>
  <Head title="Paramètres" />
  <form class="flex-1 bg-white p-6 lg:p-8" @submit.prevent="submit">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p class="text-[12.5px] text-[#667085]">Identité légale, RIB/IBAN, numérotation & plafond</p>
        <h1 class="mt-1 text-[26px] font-bold tracking-[-0.025em]">Paramètres de l'Auto-Entrepreneur</h1>
      </div>
      <button type="submit" class="rounded-[12px] bg-[#2457F5] px-4 py-2.5 text-[12.5px] font-semibold text-white hover:bg-[#1B45C9]" :disabled="form.processing">
        Enregistrer les modifications
      </button>
    </header>

    <div class="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div class="space-y-5 lg:col-span-6">
        <section class="rounded-[20px] border border-[#E3E6EC] p-6">
          <h2 class="flex items-center gap-2 text-[15px] font-bold"><Building2 class="h-4 w-4 text-[#2457F5]" /> Profil juridique & identifiants</h2>
          <label class="mt-3 block"><span class="text-[11px] text-[#525866]">Nom commercial</span><input v-model="form.name" class="mt-1 w-full rounded-[12px] border border-[#E3E6EC] px-3 py-2.5 text-[13px]" /></label>
          <div class="mt-3 grid grid-cols-2 gap-3">
            <label><span class="text-[11px] text-[#525866]">ICE (15 chiffres)</span><input v-model="form.ice" class="mt-1 w-full rounded-[12px] border px-3 py-2.5 text-[13px] tabular" :class="form.errors.ice ? 'border-[#A31D1D]' : 'border-[#E3E6EC]'" /><span v-if="form.errors.ice" class="text-[11px] font-medium text-[#A31D1D]">{{ form.errors.ice }}</span></label>
            <label><span class="text-[11px] text-[#525866]">N° Auto-Entrepreneur</span><input v-model="form.auto_entrepreneur_number" class="mt-1 w-full rounded-[12px] border border-[#E3E6EC] px-3 py-2.5 text-[13px] tabular" /></label>
            <label><span class="text-[11px] text-[#525866]">Identifiant fiscal</span><input v-model="form.identifiant_fiscal" class="mt-1 w-full rounded-[12px] border border-[#E3E6EC] px-3 py-2.5 text-[13px]" /></label>
            <label><span class="text-[11px] text-[#525866]">Taxe professionnelle</span><input v-model="form.taxe_professionnelle" class="mt-1 w-full rounded-[12px] border border-[#E3E6EC] px-3 py-2.5 text-[13px]" /></label>
          </div>
        </section>

        <section class="rounded-[20px] border border-[#E3E6EC] p-6">
          <h2 class="flex items-center gap-2 text-[15px] font-bold"><ShieldCheck class="h-4 w-4 text-[#0F3D3A]" /> Plafond annuel (Loi 114-13)</h2>
          <div class="mt-3 grid grid-cols-2 gap-3">
            <button type="button" class="rounded-[16px] border p-4 text-start" :class="form.annual_ceiling_mad === 200000 ? 'border-[#0F3D3A] bg-[#0F3D3A] text-white' : 'border-[#E3E6EC] bg-[#F8F9FB]'" @click="form.annual_ceiling_mad = 200000; form.activity_category = 'services'">
              <p class="text-[12px] opacity-80">Prestations de services</p><p class="mt-1 text-[18px] font-bold tabular">200 000 MAD / an</p><p class="mt-1 text-[11px] opacity-80">IR libératoire : 1 %</p>
            </button>
            <button type="button" class="rounded-[16px] border p-4 text-start" :class="form.annual_ceiling_mad === 500000 ? 'border-[#0F3D3A] bg-[#0F3D3A] text-white' : 'border-[#E3E6EC] bg-[#F8F9FB]'" @click="form.annual_ceiling_mad = 500000; form.activity_category = 'commercial'">
              <p class="text-[12px] opacity-80">Commerce & artisanat</p><p class="mt-1 text-[18px] font-bold tabular">500 000 MAD / an</p><p class="mt-1 text-[11px] opacity-80">IR libératoire : 0,5 %</p>
            </button>
          </div>
        </section>

        <section class="rounded-[20px] border border-[#E3E6EC] p-6">
          <h2 class="flex items-center gap-2 text-[15px] font-bold"><Hash class="h-4 w-4 text-[#2457F5]" /> Numérotation verrouillée ({{ new Date().getFullYear() }})</h2>
          <div class="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <div v-for="sequence in sequences" :key="sequence.id" class="rounded-[12px] bg-[#F8F9FB] p-3">
              <p class="text-[10.5px] font-semibold uppercase text-[#667085]">{{ sequence.document_type }}</p>
              <p class="mt-1 flex items-center gap-1 text-[12.5px] font-bold tabular"><Lock class="h-3 w-3 text-[#0F3D3A]" /> {{ sequence.prefix }}-{{ sequence.year }}-{{ String(sequence.next_number).padStart(sequence.padding, '0') }}</p>
            </div>
          </div>
        </section>
      </div>

      <div class="space-y-5 lg:col-span-6">
        <section class="rounded-[20px] border border-[#E3E6EC] p-6">
          <h2 class="flex items-center gap-2 text-[15px] font-bold"><Landmark class="h-4 w-4 text-[#2457F5]" /> Coordonnées bancaires par devise</h2>
          <div class="mt-3 space-y-3">
            <div v-for="(bank, index) in banks" :key="index" class="rounded-[14px] border border-[#E3E6EC] bg-[#F8F9FB] p-3.5">
              <div class="flex items-center justify-between">
                <span class="flex items-center gap-2 text-[13px] font-bold"><CountryFlag :code="bank.currency" :size="18" /> {{ bank.currency }} — {{ bank.bank_name }}</span>
                <span class="rounded border border-[#E3E6EC] bg-white px-2 py-0.5 text-[10.5px] font-semibold">{{ bank.currency === 'MAD' ? 'RIB' : 'SWIFT ' + bank.swift_bic }}</span>
              </div>
              <input v-model="bank.rib_or_iban" class="mt-2 w-full rounded-[10px] border border-[#E3E6EC] bg-white px-3 py-2 text-[12px] font-semibold tabular" :aria-label="`${bank.currency} RIB ou IBAN`" />
            </div>
            <p v-if="banks.length === 0" class="text-[12.5px] text-[#667085]">Ajoutez un compte RIB (MAD) et des comptes IBAN/SWIFT pour vos devises.</p>
          </div>
        </section>

        <section class="rounded-[20px] border border-[#E3E6EC] p-6">
          <h2 class="text-[15px] font-bold">Mentions légales par juridiction</h2>
          <label class="mt-3 block"><span class="text-[11px] text-[#525866]">Maroc (FR) — TVA non applicable, Art. 89 CGI</span><textarea v-model="form.legal_mentions.maFR" rows="2" class="mt-1 w-full rounded-[12px] border border-[#E3E6EC] px-3 py-2 text-[11.5px]" /></label>
          <label class="mt-3 block"><span class="text-[11px] text-[#525866]">Export (FR) — Art. 92 CGI</span><textarea v-model="form.legal_mentions.exportFR" rows="2" class="mt-1 w-full rounded-[12px] border border-[#E3E6EC] px-3 py-2 text-[11.5px]" /></label>
          <label class="mt-3 block" dir="rtl"><span class="text-[11px] text-[#525866]">المغرب (AR RTL)</span><textarea v-model="form.legal_mentions.maAR" rows="2" class="mt-1 w-full rounded-[12px] border border-[#E3E6EC] px-3 py-2 font-arabic text-[11.5px]" /></label>
        </section>

        <section class="rounded-[20px] border border-[#E3E6EC] p-5">
          <h2 class="text-[15px] font-bold">Abonnement & limites d'usage</h2>
          <p class="mt-1 text-[12.5px] text-[#667085]">Plan actuel : {{ subscription.plan }} · documents ce mois : {{ subscription.usage.documents_this_month }} · clients : {{ subscription.usage.clients }}</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <Link v-for="(plan, key) in plans" :key="key" :href="`/${page.props.organization.slug}/settings`" class="rounded-[10px] border border-[#E3E6EC] bg-[#F8F9FB] px-3 py-1.5 text-[11.5px] font-semibold">{{ plan.label }} · {{ plan.price_mad }} MAD</Link>
          </div>
        </section>
      </div>
    </div>
  </form>
</template>
