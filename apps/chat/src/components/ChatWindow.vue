<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { GLASS_EVENTS } from '@glass/types'
import { db, useChat } from '@glass/ws-client'

import { liveQuery } from 'dexie'

import type { GlassAuthReadyDetail, GlassChatOpenDetail } from '@glass/types'
import type { WsEvent } from '@glass/ws-client'

const STORAGE_KEY = 'glass-auth-user'

interface StoredAuth {
  id: string
  email: string
}

interface ViewMessage {
  id: string
  text: string
  status: string
  sentAt: number
  senderId: string
}

const currentRoomId = ref<string | null>(null)
const currentUserId = ref<string | null>(null)
const inputText = ref('')
const messages = ref<ViewMessage[]>([])
const messagesListEl = ref<HTMLElement | null>(null)

let lastRoomId: string | null = null
let chat: ReturnType<typeof useChat> | null = null
let stopMessagesWatch: (() => void) | null = null

const relayWsUrl = import.meta.env.VITE_GLASS_RELAY_WS_URL ?? 'ws://localhost:4000/ws'

// Fallback: read userId from localStorage if AUTH_READY was missed before mount
function readUserIdFromStorage(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredAuth>
    return typeof parsed.id === 'string' ? parsed.id : null
  } catch {
    return null
  }
}

async function scrollToBottom() {
  await nextTick()
  if (messagesListEl.value) {
    messagesListEl.value.scrollTop = messagesListEl.value.scrollHeight
  }
}

watch(
  messages,
  () => {
    scrollToBottom()
  },
  { flush: 'post' },
)

function startMessagesWatch(roomId: string) {
  stopMessagesWatch?.()
  messages.value = []

  const subscription = liveQuery(async () => {
    const rows = await db.messages.where('conversationId').equals(roomId).sortBy('sentAt')
    return rows.map((row) => ({
      id: row.id,
      text: row.cipherText,
      status: row.status,
      sentAt: row.sentAt,
      senderId: row.senderId,
    }))
  }).subscribe({
    next(value) {
      messages.value = value
    },
    error(_err) {
      messages.value = []
    },
  })

  stopMessagesWatch = () => subscription.unsubscribe()
}

function initChat(userId: string, roomId: string, peerId?: string) {
  if (!chat) {
    chat = useChat({
      wsUrl: relayWsUrl,
      userId,
      onEvent: (_event: WsEvent) => {},
    })
    chat.connect()
  }

  if (lastRoomId && lastRoomId !== roomId) {
    chat.leaveRoom(lastRoomId)
  }

  chat.joinRoom(roomId, peerId)
  lastRoomId = roomId

  startMessagesWatch(roomId)
}

function handleChatOpen(event: Event) {
  const detail = (event as CustomEvent<GlassChatOpenDetail>).detail
  const { roomId, peerId } = detail ?? {}
  if (!roomId || typeof roomId !== 'string') return

  currentRoomId.value = roomId

  if (currentUserId.value) {
    initChat(currentUserId.value, roomId, peerId)
  }
}

function handleAuthReady(event: Event) {
  const detail = (event as CustomEvent<GlassAuthReadyDetail>).detail
  const userId = detail?.userId
  if (!userId || typeof userId !== 'string') return

  currentUserId.value = userId

  if (currentRoomId.value) {
    initChat(userId, currentRoomId.value)
  }
}

function sendCurrentMessage() {
  if (!chat || !currentRoomId.value) return

  const text = inputText.value.trim()
  if (!text) return

  chat.sendMessage(currentRoomId.value, text)
  inputText.value = ''
}

onMounted(() => {
  window.addEventListener(GLASS_EVENTS.CHAT_OPEN, handleChatOpen)
  window.addEventListener(GLASS_EVENTS.AUTH_READY, handleAuthReady)

  // AUTH_READY may have fired before this remote mounted — read from storage as fallback
  const storedUserId = readUserIdFromStorage()
  if (storedUserId && !currentUserId.value) {
    currentUserId.value = storedUserId
  }
})

onBeforeUnmount(() => {
  window.removeEventListener(GLASS_EVENTS.CHAT_OPEN, handleChatOpen)
  window.removeEventListener(GLASS_EVENTS.AUTH_READY, handleAuthReady)
  stopMessagesWatch?.()
  chat?.disconnect()
})
</script>

<template>
  <div class="chat-window">
    <div v-if="!currentRoomId" class="chat-window__placeholder">
      <p class="chat-window__placeholder-text">Select a conversation to start chatting</p>
    </div>

    <div v-else class="chat-window__content">
      <header class="chat-window__header">
        <h2 class="chat-window__title">{{ currentRoomId }}</h2>
        <p class="chat-window__user">You: {{ currentUserId ?? 'anonymous' }}</p>
      </header>

      <main class="chat-window__body">
        <section ref="messagesListEl" class="chat-window__messages">
          <template v-if="messages.length">
            <ul class="chat-window__messages-list">
              <li v-for="msg in messages" :key="msg.id" class="chat-window__message">
                <span class="chat-window__message-text">{{ msg.text }}</span>
                <span class="chat-window__message-meta">
                  {{ msg.status }} · {{ new Date(msg.sentAt).toLocaleTimeString() }}
                </span>
              </li>
            </ul>
          </template>
          <p v-else class="chat-window__empty">No messages yet. Type something below to start.</p>
        </section>

        <section class="chat-window__input">
          <input
            v-model="inputText"
            class="chat-window__input-field"
            type="text"
            placeholder="Type a message…"
            @keyup.enter="sendCurrentMessage"
          />
          <button
            class="chat-window__send-button"
            :disabled="!inputText.trim() || !currentRoomId || !currentUserId"
            @click="sendCurrentMessage"
          >
            Send
          </button>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-window {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;

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
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  &__header {
    flex-shrink: 0;
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__body {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  &__messages {
    flex: 1;
    min-height: 0;
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

  &__message {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  &__message-text {
    font-size: 0.95rem;
  }

  &__message-meta {
    font-size: 0.72rem;
    opacity: 0.65;
  }

  &__input {
    flex-shrink: 0;
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

    &:disabled {
      opacity: 0.5;
      cursor: default;
    }
  }
}
</style>
