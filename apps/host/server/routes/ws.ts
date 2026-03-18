/* eslint-disable no-console */
import type { WsEvent } from '@glass/types'

const RATE_MAX = 30
const RATE_WINDOW_MS = 10_000

// Phase 5: move to runtimeConfig
const ALLOWED_ORIGINS = new Set(['http://localhost:3000'])

const peerMeta = new Map<string, { userId: string; roomId: string }>()
const rateWindows = new Map<string, number[]>()

function isRateLimited(userId: string): boolean {
  const now = Date.now()
  const prev = rateWindows.get(userId) ?? []
  const next = prev.filter((t) => now - t < RATE_WINDOW_MS)
  if (next.length >= RATE_MAX) return true
  next.push(now)
  rateWindows.set(userId, next)
  return false
}

export default defineWebSocketHandler({
  open(peer) {
    const origin = peer.request?.headers.get('origin') ?? ''
    console.log('[ws] open', { id: peer.id, origin })

    if (!ALLOWED_ORIGINS.has(origin)) {
      console.log('[ws] close forbidden origin', origin)
      peer.close(1008, 'Forbidden')
    }
  },

  message(peer, msg) {
    console.log('[ws] message from client', {
      id: peer.id,
      text: msg.text(),
    })

    let event: WsEvent
    try {
      event = JSON.parse(msg.text()) as WsEvent
    } catch (err) {
      console.error('[ws] bad payload', err)
      peer.close(1003, 'Bad payload')
      return
    }

    console.log('[ws] parsed event', { type: event.type, roomId: event.roomId })

    const { type, roomId } = event

    if (type === 'join') {
      const { userId } = event.payload
      peer.subscribe(roomId)
      peerMeta.set(peer.id, { userId, roomId })
      peer.publish(roomId, msg.text())
      return
    }

    if (type === 'leave') {
      const meta = peerMeta.get(peer.id)
      if (meta) {
        peer.publish(roomId, msg.text())
        peer.unsubscribe(roomId)
        peerMeta.delete(peer.id)
        rateWindows.delete(meta.userId)
      }
      return
    }

    const meta = peerMeta.get(peer.id)
    if (!meta) {
      peer.close(1008, 'Not joined')
      return
    }

    if (isRateLimited(meta.userId)) {
      peer.send(JSON.stringify({ type: 'error', code: 429 }))
      return
    }

    peer.publish(roomId, msg.text()) // relay to room, excludes sender
  },

  close(peer) {
    const meta = peerMeta.get(peer.id)
    if (meta) {
      rateWindows.delete(meta.userId)
      peerMeta.delete(peer.id)
    }
  },

  error(_, err) {
    console.error('[ws]', err)
  },
})
