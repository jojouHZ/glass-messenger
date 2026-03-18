/* eslint-disable no-console */
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
  joinRoom: (roomId: string) => void
  leaveRoom: (roomId: string) => void
  sendMessage: (roomId: string, text: string) => void
  isConnected: () => boolean
}

const pendingEvents: WsEvent[] = []

/**
 * Minimal WS client for Phase 2:
 * - single WS connection per instance
 * - no reconnection, no Dexie, no crypto
 */
export function useChat(options: UseChatOptions): UseChatResult {
  const { wsUrl, userId, onEvent } = options

  let socket: WebSocket | null = null
  let connected = false

  const safeSend = (event: WsEvent) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn('[chat] queue event until socket open', event.type)
      pendingEvents.push(event)
      return
    }
    socket.send(JSON.stringify(event))
  }

  const handleOpen = () => {
    connected = true
    console.log('[chat] socket open', wsUrl)
    for (const ev of pendingEvents.splice(0)) {
      socket?.send(JSON.stringify(ev))
    }
  }

  const handleMessage = (event: MessageEvent) => {
    console.log('[chat] raw message from server', event.data)
    try {
      const parsed = JSON.parse(event.data as string) as WsEvent
      console.log('[chat] parsed WsEvent', parsed)
      onEvent?.(parsed)
    } catch (err) {
      console.error('[chat] failed to parse message', err)
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

  const joinRoom = (roomId: string) => {
    if (!socket || socket.readyState === WebSocket.CLOSED) {
      console.log('[chat] joinRoom: no socket or closed, calling connect()')
      connect()
    }

    const event: WsEvent = {
      type: 'join',
      roomId,
      payload: { userId, roomId },
    }
    console.log('[chat] joinRoom: sending', event)
    safeSend(event)
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

  const sendMessage = (roomId: string, text: string) => {
    const event: WsEvent = {
      type: 'message',
      roomId,
      payload: {
        messageId: crypto.randomUUID(),
        senderId: userId,
        storedPayload: text, // Phase 2: plaintext, Phase 4: AES-GCM
        iv: '', // Phase 2: пусто, Phase 4: реальный IV
      },
    }
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
