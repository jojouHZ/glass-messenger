<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

import AppShell from '~/components/AppShell.vue'

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
  <AppShell>
    <main class="layout">
      <div class="layout__sidebar">
        <FriendsList />
      </div>
      <div class="layout__main">
        <ChatWindow />
      </div>
    </main>
  </AppShell>
</template>

<style scoped lang="scss">
.layout {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  height: 100%;
  overflow: hidden;

  &__sidebar {
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    overflow-y: auto;
    min-height: 0;
  }

  &__main {
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;

    > * {
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }
  }
}

@media (max-width: 768px) {
  .layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    height: 100vh;
  }

  .layout__sidebar {
    max-height: 260px;
  }

  .layout__main {
    min-height: 0;
  }
}
</style>
