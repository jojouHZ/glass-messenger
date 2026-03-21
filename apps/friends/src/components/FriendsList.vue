<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { GLASS_EVENTS } from '@glass/types'
import { db } from '@glass/ws-client'

import { liveQuery } from 'dexie'

import type { GlassAuthReadyDetail, GlassChatOpenDetail } from '@glass/types'
import type { DbSession } from '@glass/ws-client'

interface FriendItem {
  id: string
  displayName: string
  sessionId: string
  peerId: string
}

const props = defineProps<{
  friends?: FriendItem[]
}>()

const selfId = ref<string | null>(null)
const sessions = ref<DbSession[]>([])
let stopSessionsWatch: (() => void) | null = null

function startSessionsWatch(uid: string) {
  stopSessionsWatch?.()
  sessions.value = []

  const subscription = liveQuery(async () => {
    const rows = await db.sessions.toArray()
    return rows.filter((s) => s.selfId === uid)
  }).subscribe({
    next(value) {
      sessions.value = value
    },
    error(_err) {
      sessions.value = []
    },
  })

  stopSessionsWatch = () => subscription.unsubscribe()
}

function handleAuthReady(event: Event) {
  const detail = (event as CustomEvent<GlassAuthReadyDetail>).detail
  if (!detail?.userId) return

  selfId.value = detail.userId
  startSessionsWatch(detail.userId)
}

const STORAGE_KEY = 'glass-auth-user'

interface StoredAuth {
  id: string
  email: string
}

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

const normalizedFriends = computed<FriendItem[]>(() => {
  if (props.friends?.length) return props.friends

  if (sessions.value.length > 0) {
    return sessions.value.map((session) => ({
      id: session.peerId,
      displayName: session.peerId, // Phase C: replace with contact displayName
      sessionId: session.id,
      peerId: session.peerId,
    }))
  }

  // fallback mock — visible only before any real session exists
  return [
    { id: '1', displayName: 'Alice', sessionId: 'mock-room-1', peerId: 'mock-peer-1' },
    { id: '2', displayName: 'Bob', sessionId: 'mock-room-2', peerId: 'mock-peer-2' },
  ]
})

function emitChatOpen(sessionId: string, peerId: string) {
  if (typeof window === 'undefined') return

  const detail: GlassChatOpenDetail = { roomId: sessionId, peerId }
  window.dispatchEvent(new CustomEvent(GLASS_EVENTS.CHAT_OPEN, { detail }))
}

function handleFriendClick(friend: FriendItem) {
  emitChatOpen(friend.sessionId, friend.peerId)
}

onMounted(() => {
  window.addEventListener(GLASS_EVENTS.AUTH_READY, handleAuthReady)

  // AUTH_READY may have fired before this remote mounted — read from storage as fallback
  if (!selfId.value) {
    const storedUserId = readUserIdFromStorage()
    if (storedUserId) {
      selfId.value = storedUserId
      startSessionsWatch(storedUserId)
    }
  }
})

onBeforeUnmount(() => {
  window.removeEventListener(GLASS_EVENTS.AUTH_READY, handleAuthReady)
  stopSessionsWatch?.()
})
</script>

<template>
  <div class="friends-list">
    <ul class="friends-list__items">
      <li v-for="friend in normalizedFriends" :key="friend.sessionId" class="friends-list__item">
        <button type="button" class="friends-list__button" @click="handleFriendClick(friend)">
          <span class="friends-list__name">
            {{ friend.displayName }}
          </span>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.friends-list {
  &__items {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  &__item + &__item {
    margin-top: 0.25rem;
  }

  &__button {
    width: 100%;
    text-align: left;
    border: none;
    background: transparent;
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    color: #e2e8f0;
  }

  &__name {
    font-size: 0.9rem;
  }
}
</style>
