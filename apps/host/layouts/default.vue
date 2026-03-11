<script setup lang="ts">
import { useRouter } from 'vue-router'

import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const auth = useAuthStore()

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="app-shell">
    <header class="app-shell__header">
      <div class="app-shell__logo">Glass Messenger</div>

      <nav class="app-shell__nav">
        <span class="app-shell__nav-item app-shell__nav-item--active"> Chats </span>
        <span class="app-shell__nav-item"> Settings </span>
      </nav>

      <button class="app-shell__logout" type="button" @click="handleLogout">Logout</button>
    </header>

    <main class="app-shell__main">
      <slot />
    </main>
  </div>
</template>

<style scoped lang="scss">
/* ... остальное как раньше ... */

.app-shell__logout {
  margin-left: var(--spacing-md);
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.5);
  background: transparent;
  color: var(--color-muted);
  font-size: 0.75rem;
  cursor: pointer;
}
</style>
