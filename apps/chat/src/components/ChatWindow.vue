<!-- eslint-disable no-console -->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

interface GlassChatOpenDetail {
  roomId: string
}

interface GlassAuthReadyDetail {
  userId: string
}

const currentRoomId = ref<string | null>(null)
const currentUserId = ref<string | null>(null)

function handleChatOpen(event: Event) {
  console.log('ChatWindow handleChatOpen raw event', event)

  const customEvent = event as CustomEvent<GlassChatOpenDetail>
  console.log('ChatWindow detail', customEvent.detail)

  const roomId = customEvent.detail?.roomId
  if (!roomId || typeof roomId !== 'string') return

  currentRoomId.value = roomId
  console.log('currentRoomId ref now =', currentRoomId.value)
}

function handleAuthReady(event: Event) {
  const customEvent = event as CustomEvent<GlassAuthReadyDetail>
  const userId = customEvent.detail?.userId
  if (!userId || typeof userId !== 'string') return

  currentUserId.value = userId
}

onMounted(() => {
  window.addEventListener('glass:chat-open', handleChatOpen)
  window.addEventListener('glass:auth-ready', handleAuthReady)
})

onBeforeUnmount(() => {
  window.removeEventListener('glass:chat-open', handleChatOpen)
  window.removeEventListener('glass:auth-ready', handleAuthReady)
})
</script>

<template>
  <div>CHATWINDOW INSTANCE ID: {{ Math.random() }}</div>
  <div v-if="!currentRoomId" class="chat-window__placeholder">
    <p class="chat-window__placeholder-text">PLACEHOLDER FOR NULL</p>
  </div>

  <div v-else class="chat-window__content">
    <header class="chat-window__header">
      <h2 class="chat-window__title">ACTIVE: {{ currentRoomId }}</h2>
      <p class="chat-window__user">You: {{ currentUserId ?? 'anonymous' }}</p>
    </header>

    <main class="chat-window__body">
      <p>Mock messages for room {{ currentRoomId }}</p>
    </main>
  </div>
</template>

<style scoped lang="scss">
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__placeholder {
    margin: auto;
    text-align: center;
    opacity: 0.7;
  }

  &__placeholder-text {
    font-size: 0.95rem;
  }

  &__content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  &__header {
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__title {
    font-size: 0.9rem;
    font-weight: 500;
    margin: 0;
  }

  &__messages {
    flex: 1;
    padding: 0.75rem;
    overflow-y: auto;
  }

  &__empty {
    opacity: 0.7;
    font-size: 0.9rem;
  }

  &__messages-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  &__message + &__message {
    margin-top: 0.25rem;
  }

  &__input {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__input-field {
    flex: 1;
    padding: 0.35rem 0.5rem;
  }

  &__send-button {
    padding: 0.35rem 0.75rem;
    cursor: pointer;
  }

  &__send-button:disabled {
    opacity: 0.5;
    cursor: default;
  }
}
</style>
