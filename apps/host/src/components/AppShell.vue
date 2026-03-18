<script setup lang="ts">
import { useRouter } from 'vue-router'

import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const router = useRouter()

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
        <span class="app-shell__nav-item app-shell__nav-item--active">Chats</span>
        <span class="app-shell__nav-item">Settings</span>
      </nav>

      <button class="app-shell__logout" type="button" @click="handleLogout">Logout</button>
    </header>

    <main class="app-shell__main">
      <slot />
    </main>
  </div>
</template>

<style scoped lang="scss">
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-bg);
  color: var(--color-text);
}

.app-shell__header {
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-md);
  height: 48px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
  flex-shrink: 0;
}

.app-shell__logo {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text);
  margin-right: var(--spacing-lg);
}

.app-shell__nav {
  display: flex;
  gap: var(--spacing-md);
  flex: 1;
}

.app-shell__nav-item {
  font-size: 0.85rem;
  color: var(--color-muted);
  cursor: pointer;

  &--active {
    color: var(--color-text);
  }
}

.app-shell__logout {
  margin-left: var(--spacing-md);
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.5);
  background: transparent;
  color: var(--color-muted);
  font-size: 0.75rem;
  cursor: pointer;

  &:hover {
    color: var(--color-text);
  }
}

.app-shell__main {
  flex: 1;
  overflow: hidden;
}
</style>
