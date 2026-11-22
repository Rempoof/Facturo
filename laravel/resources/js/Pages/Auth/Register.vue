<script setup lang="ts">
import { Head, Link, useForm } from '@inertiajs/vue3'

const props = defineProps<{ invitation?: string | null; email?: string | null }>()

const form = useForm({
  name: '', email: props.email ?? '', password: '', password_confirmation: '',
  organization_name: '', activity_category: 'services', terms: false,
})

function submit() {
  form.post('/register', { onFinish: () => form.reset('password', 'password_confirmation') })
}
</script>

<template>
  <Head title="Inscription" />
  <div class="flex min-h-screen items-center justify-center bg-[#F7F8FA] px-4 py-10">
    <div class="w-full max-w-[460px] rounded-[20px] border border-[#E3E6EC] bg-white p-7">
      <div class="flex items-center gap-2.5">
        <span class="flex h-9 w-9 items-center justify-center rounded-full bg-[#14171F] text-[16px] font-bold text-white">F</span>
        <span class="text-[18px] font-bold">Facturo</span>
      </div>
      <h1 class="mt-5 text-[20px] font-bold">Créer votre espace Auto-Entrepreneur</h1>
      <p class="mt-1 text-[12.5px] text-[#667085]">14 jours d'essai, sans engagement. ICE et plafond configurables ensuite.</p>

      <form class="mt-5 space-y-3" @submit.prevent="submit">
        <label class="block"><span class="text-[11px] text-[#525866]">Nom & prénom *</span><input v-model="form.name" required class="mt-1 w-full rounded-[12px] border border-[#E3E6EC] px-3 py-2.5 text-[13px]" /><span v-if="form.errors.name" class="text-[11px] text-[#A31D1D]">{{ form.errors.name }}</span></label>
        <label class="block"><span class="text-[11px] text-[#525866]">E-mail professionnel *</span><input v-model="form.email" type="email" required class="mt-1 w-full rounded-[12px] border border-[#E3E6EC] px-3 py-2.5 text-[13px]" /><span v-if="form.errors.email" class="text-[11px] text-[#A31D1D]">{{ form.errors.email }}</span></label>
        <div class="grid grid-cols-2 gap-3">
          <label><span class="text-[11px] text-[#525866]">Mot de passe *</span><input v-model="form.password" type="password" required class="mt-1 w-full rounded-[12px] border border-[#E3E6EC] px-3 py-2.5 text-[13px]" /><span v-if="form.errors.password" class="text-[11px] text-[#A31D1D]">{{ form.errors.password }}</span></label>
          <label><span class="text-[11px] text-[#525866]">Confirmation *</span><input v-model="form.password_confirmation" type="password" required class="mt-1 w-full rounded-[12px] border border-[#E3E6EC] px-3 py-2.5 text-[13px]" /></label>
        </div>
        <label class="block"><span class="text-[11px] text-[#525866]">Nom de l'activité *</span><input v-model="form.organization_name" required class="mt-1 w-full rounded-[12px] border border-[#E3E6EC] px-3 py-2.5 text-[13px]" /></label>
        <label class="block"><span class="text-[11px] text-[#525866]">Activité</span>
          <select v-model="form.activity_category" class="mt-1 w-full rounded-[12px] border border-[#E3E6EC] px-3 py-2.5 text-[13px]"><option value="services">Services (200 000 MAD)</option><option value="commercial">Commerce (500 000 MAD)</option></select>
        </label>
        <label class="flex items-center gap-2 text-[12.5px] text-[#525866]"><input v-model="form.terms" type="checkbox" required class="h-4 w-4 rounded accent-[#2457F5]" /> J'accepte les conditions d'utilisation</label>
        <button type="submit" class="w-full rounded-[12px] bg-[#2457F5] py-2.5 text-[13px] font-semibold text-white hover:bg-[#1B45C9]" :disabled="form.processing">Activer mon espace</button>
      </form>

      <p class="mt-4 text-center text-[12px] text-[#667085]">Déjà un compte ? <Link href="/login" class="font-medium text-[#2457F5] hover:underline">Se connecter</Link></p>
    </div>
  </div>
</template>
