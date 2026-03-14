<script setup lang="ts">
import { onMounted,ref } from 'vue'
import { useRouter } from '#app'

import { useAuthStore } from '~/stores/auth'

const email = ref('')
const auth = useAuthStore()
const router = useRouter()

onMounted(() => {
  if (auth.isAuthenticated) {
    router.push('/')
  }
})

const onSubmit = () => {
  auth.loginMock(email.value)
  router.push('/')
}
</script>

<template>
  <main class="login">
    <h1>Glass Messenger</h1>

    <form @submit.prevent="onSubmit">
      <label>
        Email
        <input
          v-model="email"
          type="email"
          placeholder="you@example.com"
          required
        >
      </label>

      <button type="submit">
        Sign in (mock)
      </button>
    </form>
  </main>
</template>
