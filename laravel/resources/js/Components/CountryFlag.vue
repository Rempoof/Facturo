<script setup lang="ts">
defineProps<{ code: string; size?: number }>()
</script>

<template>
  <svg :width="size ?? 18" :height="size ?? 18" viewBox="0 0 24 24" aria-hidden="true" class="shrink-0">
    <template v-if="['MA', 'MAD'].includes(code.toUpperCase())">
      <circle cx="12" cy="12" r="12" fill="#C1272D" />
      <path d="M12 6.4 13.45 10.85H18.1L14.35 13.55 15.8 18 12 15.25 8.2 18l1.45-4.45H5.9l3.65-2.7Z" fill="none" stroke="#006233" stroke-width="1.55" />
    </template>
    <template v-else-if="['EU', 'EUR', 'FR'].includes(code.toUpperCase())">
      <circle cx="12" cy="12" r="12" fill="#003399" />
      <circle v-for="deg in [0, 45, 90, 135, 180, 225, 270, 315]" :key="deg" :cx="12 + 6.4 * Math.cos((deg * Math.PI) / 180)" :cy="12 + 6.4 * Math.sin((deg * Math.PI) / 180)" r="1.15" fill="#FFCC00" />
    </template>
    <template v-else-if="['CH', 'CHF'].includes(code.toUpperCase())">
      <circle cx="12" cy="12" r="12" fill="#D52B1E" />
      <rect x="10.2" y="6" width="3.6" height="12" rx=".6" fill="#fff" />
      <rect x="6" y="10.2" width="12" height="3.6" rx=".6" fill="#fff" />
    </template>
    <template v-else>
      <circle cx="12" cy="12" r="12" fill="#3C3B6E" />
      <rect y="3" width="24" height="2.6" fill="#B22234" />
      <rect y="10" width="24" height="2.6" fill="#B22234" />
      <rect y="17" width="24" height="2.6" fill="#B22234" />
    </template>
  </svg>
</template>
