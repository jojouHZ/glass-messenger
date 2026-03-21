import { db } from './db'

import type { WsEvent } from '@glass/types'
export type { WsEvent } from '@glass/types'

export type ChatEventHandler = (event: WsEvent) => void

export interface UseChatOptions {
  wsUrl: string
  userId: string
  onEvent?: ChatEventHandler
}

export interface UseChatResult {
  connect: () => void
  disconnect: () => void
  joinRoom: (roomId: string, peerId?: string) => void
  leaveRoom: (roomId: string) => void
  sendMessage: (roomId: string, text: string) => void
  isConnected: () => boolean
}

const pendingEvents: WsEvent[] = []

function createMessageId(conversationId: string): string {
  return `${conversationId}::${Date.now()}::${crypto.randomUUID()}`
}

async function persistOutgoingMessage(params: {
  conversationId: string
  senderId: string
  text: string
}): Promise<WsEvent> {
  const { conversationId, senderId, text } = params
  const now = Date.now()
  const messageId = createMessageId(conversationId)

  const event: WsEvent = {
    type: 'message',
    roomId: conversationId,
    payload: {
      messageId,
      senderId,
      storedPayload: text,
      iv: '',
    },
  }

  await db.transaction('rw', db.messages, db.outbox, async () => {
    await db.messages.put({
      id: messageId,
      conversationId,
      senderId,
      type: 'text',
      cipherText: text,
      sentAt: now,
      status: 'pending',
    })

    await db.outbox.put({
      id: messageId,
      messageId,
      conversationId,
      payload: text,
      createdAt: now,
    })
  })

  return event
}

async function markMessageDelivered(messageId: string): Promise<void> {
  await db.transaction('rw', db.messages, db.outbox, async () => {
    const message = await db.messages.get(messageId)
    if (message) {
      message.status = 'delivered'
      message.receivedAt = Date.now()
      await db.messages.put(message)
    }

    await db.outbox.delete(messageId)
  })
}

async function upsertSession(roomId: string, selfId: string, peerId: string): Promise<void> {
  const existing = await db.sessions.get(roomId)
  if (existing && existing.selfId === selfId) return // skip only if same user

  const now = Date.now()
  await db.sessions.put({
    id: roomId,
    selfId,
    peerId,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  })
}

/**
 * Minimal WS client for Phase 2:
 * - single WS connection per instance
 * - no reconnection, no crypto
 * - Dexie WAL for outgoing messages
 */
export function useChat(options: UseChatOptions): UseChatResult {
  const { wsUrl, userId, onEvent } = options

  let socket: WebSocket | null = null
  let connected = false

  const safeSend = (event: WsEvent) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      pendingEvents.push(event)

      return
    }

    socket.send(JSON.stringify(event))
  }

  const handleOpen = () => {
    connected = true

    for (const ev of pendingEvents.splice(0)) {
      socket?.send(JSON.stringify(ev))
    }
  }

  const handleMessage = async (event: MessageEvent) => {
    try {
      const parsed = JSON.parse(String(event.data)) as WsEvent

      if (parsed.type === 'ack') {
        const payload = parsed.payload as { messageId?: string; status?: string }

        if (!payload.messageId) {
          return
        }

        await markMessageDelivered(payload.messageId)
        return
      }

      onEvent?.(parsed)
      // eslint-disable-next-line unused-imports/no-unused-vars
    } catch (_err) {
      // TODO PH3
    }
  }

  const handleClose = () => {
    connected = false
    socket = null
  }

  const handleError = () => {
    // keep minimal for Phase 2
  }

  const connect = () => {
    if (
      socket &&
      (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)
    ) {
      return
    }

    socket = new WebSocket(wsUrl)
    socket.addEventListener('open', handleOpen)
    socket.addEventListener('message', handleMessage)
    socket.addEventListener('close', handleClose)
    socket.addEventListener('error', handleError)
  }

  const disconnect = () => {
    if (!socket) return

    socket.removeEventListener('open', handleOpen)
    socket.removeEventListener('message', handleMessage)
    socket.removeEventListener('close', handleClose)
    socket.removeEventListener('error', handleError)
    socket.close()
    socket = null
    connected = false
  }

  const joinRoom = (roomId: string, peerId?: string) => {
    if (!socket || socket.readyState === WebSocket.CLOSED) {
      connect()
    }

    const event: WsEvent = {
      type: 'join',
      roomId,
      payload: { userId, roomId },
    }

    safeSend(event)

    if (peerId) {
      upsertSession(roomId, userId, peerId).catch(() => {})
    }
  }

  const leaveRoom = (roomId: string) => {
    if (!socket || socket.readyState === WebSocket.CLOSED) {
      connect()
    }

    const event: WsEvent = {
      type: 'leave',
      roomId,
      payload: { userId, roomId },
    }

    safeSend(event)
  }

  const sendMessage = async (roomId: string, text: string) => {
    const event = await persistOutgoingMessage({
      conversationId: roomId,
      senderId: userId,
      text,
    })

    safeSend(event)
  }

  const isConnected = () => connected

  return {
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendMessage,
    isConnected,
  }
}
