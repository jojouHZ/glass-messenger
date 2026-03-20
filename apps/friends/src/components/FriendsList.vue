<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

import { GLASS_EVENTS } from '@glass/types'
import { db } from '@glass/ws-client'

import { liveQuery } from 'dexie'

import type { GlassChatOpenDetail } from '@glass/types'
import type { DbSession } from '@glass/ws-client'

interface FriendItem {
  id: string
  displayName: string
  sessionId: string
}

const props = defineProps<{
  friends?: FriendItem[]
  selfId?: string
}>()

const sessions = ref<DbSession[]>([])
let stopSessionsWatch: (() => void) | null = null

function startSessionsWatch(selfId?: string) {
  stopSessionsWatch?.()
  sessions.value = []

  const subscription = liveQuery(async () => {
    const rows = await db.sessions.toArray()
    return selfId ? rows.filter((session) => session.selfId === selfId) : rows
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

startSessionsWatch(props.selfId)

const normalizedFriends = computed<FriendItem[]>(() => {
  if (props.friends?.length) return props.friends

  if (sessions.value.length > 0) {
    return sessions.value.map((session) => ({
      id: session.peerId,
      displayName: session.peerId,
      sessionId: session.id,
    }))
  }

  return [
    { id: '1', displayName: 'Alice', sessionId: 'mock-room-1' },
    { id: '2', displayName: 'Bob', sessionId: 'mock-room-2' },
  ]
})

function emitChatOpen(roomId: string) {
  if (typeof window === 'undefined') return

  const event = new CustomEvent<GlassChatOpenDetail>(GLASS_EVENTS.CHAT_OPEN, {
    detail: { roomId },
  })

  window.dispatchEvent(event)
}

function handleFriendClick(friend: FriendItem) {
  emitChatOpen(friend.sessionId || `mock-room-${friend.id}`)
}

onBeforeUnmount(() => {
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
