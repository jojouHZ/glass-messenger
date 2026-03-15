<script setup lang="ts">
import { GLASS_EVENTS } from '@glass/types'

import type { GlassChatOpenDetail } from '@glass/types'

interface Friend {
  id: string
  name: string
}

const friends: Friend[] = [
  { id: 'mock-room-1', name: 'Alice' },
  { id: 'mock-room-2', name: 'Bob' },
]

const openChat = (roomId: string): void => {
  window.dispatchEvent(
    new CustomEvent<GlassChatOpenDetail>(GLASS_EVENTS.CHAT_OPEN, {
      bubbles: false,
      detail: { roomId },
    }),
  )
}
</script>

<template>
  <div class="friends-list">
    <ul>
      <li v-for="friend in friends" :key="friend.id" @click="openChat(friend.id)">
        {{ friend.name }}
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.friends-list {
  padding: var(--spacing-md);
}
</style>
