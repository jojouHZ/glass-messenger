<script setup lang="ts">
import { onMounted } from 'vue'

import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()

onMounted(() => {
  auth.hydrateFromStorage()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
