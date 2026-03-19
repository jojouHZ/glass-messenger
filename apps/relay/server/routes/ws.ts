import type { WsEvent } from '@glass/types'
import type { Peer } from 'crossws'

const rooms = new Map<string, Set<Peer>>()
const peerRooms = new Map<string, Set<string>>()

function joinRoom(peer: Peer, roomId: string) {
  let set = rooms.get(roomId)
  if (!set) {
    set = new Set<Peer>()
    rooms.set(roomId, set)
  }
  set.add(peer)

  let r = peerRooms.get(peer.id)
  if (!r) {
    r = new Set<string>()
    peerRooms.set(peer.id, r)
  }
  r.add(roomId)
}

function leaveRoom(peer: Peer, roomId: string) {
  const set = rooms.get(roomId)
  set?.delete(peer)
  if (set && set.size === 0) {
    rooms.delete(roomId)
  }

  const r = peerRooms.get(peer.id)
  r?.delete(roomId)
  if (r && r.size === 0) {
    peerRooms.delete(peer.id)
  }
}

function leaveAllRooms(peer: Peer) {
  const r = peerRooms.get(peer.id)
  if (!r) return

  for (const roomId of r) {
    const set = rooms.get(roomId)
    set?.delete(peer)
    if (set && set.size === 0) {
      rooms.delete(roomId)
    }
  }

  peerRooms.delete(peer.id)
}

export default defineWebSocketHandler({
  open(peer: Peer) {
    peer.send(
      JSON.stringify({
        type: 'ack',
        roomId: '',
        payload: { status: 'connected' },
      }),
    )
  },

  message(peer: Peer, msg: { text?: () => string } | string) {
    const raw: string =
      typeof msg === 'string' ? msg : typeof msg.text === 'function' ? msg.text() : String(msg)

    let event: WsEvent
    try {
      event = JSON.parse(raw) as WsEvent
    } catch {
      console.error('[ws] failed to parse incoming message', raw)
      return
    }

    if (event.type === 'join') {
      joinRoom(peer, event.roomId)
      return
    }

    if (event.type === 'leave') {
      leaveRoom(peer, event.roomId)
      return
    }

    if (event.type === 'message') {
      const set = rooms.get(event.roomId)
      if (!set) return

      for (const client of set) {
        if (client !== peer) {
          client.send(raw)
        }
      }
    }

    // остальные типы пока игнорируем
  },

  close(peer: Peer) {
    leaveAllRooms(peer)
  },

  error(peer: Peer, error: unknown) {
    console.error('[ws] error', peer.id, error)
  },
})
