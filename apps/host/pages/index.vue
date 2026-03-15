<script setup lang="ts">
import { defineAsyncComponent, onMounted, onUnmounted, ref } from 'vue'

import { GLASS_EVENTS } from '@glass/types'

import type { GlassChatOpenEvent } from '@glass/types'

const AsyncFriendsList = defineAsyncComponent(() => import('friends/FriendsList'))
const AsyncChatWindow = defineAsyncComponent(() => import('chat/ChatWindow'))

const activeRoomId = ref<string | null>(null)

const onChatOpen = (e: Event): void => {
  activeRoomId.value = (e as GlassChatOpenEvent).detail.roomId
}

onMounted(() => {
  window.addEventListener(GLASS_EVENTS.CHAT_OPEN, onChatOpen)
})

onUnmounted(() => {
  window.removeEventListener(GLASS_EVENTS.CHAT_OPEN, onChatOpen)
})
</script>

<template>
  <div class="app-layout">
    <aside class="sidebar">
      <AsyncFriendsList />
    </aside>
    <main class="chat-area">
      <AsyncChatWindow :room-id="activeRoomId" />
    </main>
  </div>
</template>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 260px;
  border-right: 1px solid var(--color-border, #e2e8f0);
}

.chat-area {
  flex: 1;
}
</style>
