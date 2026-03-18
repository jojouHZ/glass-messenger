<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// import { useRuntimeConfig } from '#app'

const FriendsList = defineAsyncComponent(() => import('friends/FriendsList'))
const ChatWindow = defineAsyncComponent(() => import('chat/ChatWindow'))

// const authStore = useAuthStore()
// const user = authStore.user

// const config = useRuntimeConfig()
// const wsUrl = config.public.wsUrl || ''
// const userId = user?.id ?? ''
</script>

<template>
  <main class="layout">
    <FriendsList />
    <ChatWindow />
  </main>
</template>

<style scoped lang="scss">
.layout {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  height: 100vh;
  overflow: hidden;

  &__sidebar {
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    overflow-y: auto;
  }

  &__main {
    overflow: hidden;
  }

  &__loading {
    padding: 1rem;
    font-size: 0.9rem;
    opacity: 0.7;
  }
}

@media (max-width: 768px) {
  .layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
  }

  .layout__sidebar {
    max-height: 260px;
  }
}
</style>
