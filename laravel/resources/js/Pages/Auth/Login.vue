<script setup lang="ts">
import { Head, Link, useForm } from '@inertiajs/vue3'

defineProps<{ canResetPassword?: boolean; status?: string }>()

const form = useForm({ email: 'youssef.sample@atelier-exemple.ma', password: '', remember: false })

function submit() {
  form.post('/login', { onFinish: () => form.reset('password') })
}
</script>

<template>
  <Head title="Connexion" />
  <div class="flex min-h-screen items-center justify-center bg-[#F7F8FA] px-4">
    <div class="w-full max-w-[420px] rounded-[20px] border border-[#E3E6EC] bg-white p-7">
      <div class="flex items-center gap-2.5">
        <span class="flex h-9 w-9 items-center justify-center rounded-full bg-[#14171F] text-[16px] font-bold text-white">F</span>
        <span class="text-[18px] font-bold">Facturo</span>
      </div>

      <h1 class="mt-5 text-[20px] font-bold text-[#14171F]">Accéder à votre espace Auto-Entrepreneur</h1>
      <p class="mt-1 text-[12.5px] text-[#667085]">Devis, factures et plafond annuel — connexion sécurisée avec 2FA.</p>

      <div v-if="status" class="mt-3 rounded-[10px] bg-[#DDF5E6] px-3 py-2 text-[12px] font-medium text-[#0B6B3A]">{{ status }}</div>

      <form class="mt-5 space-y-3" @submit.prevent="submit">
        <label class="block"><span class="text-[11px] font-medium text-[#525866]">Adresse e-mail *</span>
          <input v-model="form.email" type="email" required class="mt-1 w-full rounded-[12px] border border-[#E3E6EC] px-3 py-2.5 text-[13px] focus:border-[#2457F5] focus:outline-none" />
          <span v-if="form.errors.email" class="text-[11px] font-medium text-[#A31D1D]">{{ form.errors.email }}</span>
        </label>
        <label class="block"><span class="text-[11px] font-medium text-[#525866]">Mot de passe *</span>
          <input v-model="form.password" type="password" required autocomplete="current-password" class="mt-1 w-full rounded-[12px] border border-[#E3E6EC] px-3 py-2.5 text-[13px] focus:border-[#2457F5] focus:outline-none" />
          <span v-if="form.errors.password" class="text-[11px] font-medium text-[#A31D1D]">{{ form.errors.password }}</span>
        </label>
        <label class="flex items-center gap-2 text-[12.5px] text-[#525866]"><input v-model="form.remember" type="checkbox" class="h-4 w-4 rounded accent-[#2457F5]" /> Se souvenir de moi</label>
        <button type="submit" class="w-full rounded-[12px] bg-[#2457F5] py-2.5 text-[13px] font-semibold text-white hover:bg-[#1B45C9]" :disabled="form.processing">Se connecter</button>
      </form>

      <p class="mt-4 flex items-center justify-between text-[12px] text-[#667085]">
        <Link v-if="canResetPassword" href="/forgot-password" class="font-medium text-[#2457F5] hover:underline">Mot de passe oublié ?</Link>
        <Link href="/register" class="font-medium text-[#2457F5] hover:underline">Créer un compte AE</Link>
      </p>
    </div>
  </div>
</template>
