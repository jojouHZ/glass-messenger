<script setup lang="ts">
import { computed } from 'vue'

import { GLASS_EVENTS } from '@glass/types'

import type { GlassChatOpenDetail } from '@glass/types'

interface FriendItem {
  id: string
  displayName: string
  // extend later with lastMessage, avatar, etc.
}

const props = defineProps<{
  friends?: FriendItem[] // сделать опциональным
}>()

const normalizedFriends = computed<FriendItem[]>(() => {
  // временный мок, пока нет реальных данных
  if (props.friends && props.friends.length > 0) return props.friends

  return [
    { id: '1', displayName: 'Alice' },
    { id: '2', displayName: 'Bob' },
  ]
})

/**
 * Emit chat-open event into global window scope.
 * This is the only place where the CustomEvent is constructed.
 */
function emitChatOpen(roomId: string) {
  if (typeof window === 'undefined') return

  const detail: GlassChatOpenDetail = { roomId }

  const event = new CustomEvent<GlassChatOpenDetail>(GLASS_EVENTS.CHAT_OPEN, {
    detail,
  })

  window.dispatchEvent(event)
}

/**
 * Click handler for friend item.
 * For now we derive a mock roomId from friend.id.
 * Later this will be replaced by real DbSession.id.
 */
function handleFriendClick(friend: FriendItem) {
  const roomId = `mock-room-${friend.id}`
  emitChatOpen(roomId)
}
</script>

<template>
  <div class="friends-list">
    <ul class="friends-list__items">
      <li v-for="friend in normalizedFriends" :key="friend.id" class="friends-list__item">
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
