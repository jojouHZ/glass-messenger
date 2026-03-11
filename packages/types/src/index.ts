// User
export interface User {
  id: string
  username: string
  publicKey: string
  createdAt: number
}

// Room
export interface Room {
  id: string
  participantIds: string[]
  createdAt: number
  lastMessageAt?: number
}

// Message
export type MessageStatus = 'pending' | 'delivered' | 'read'

export interface Message {
  id: string
  roomId: string
  senderId: string
  storedPayload: string // AES-GCM encrypted, base64
  iv: string // base64
  status: MessageStatus
  createdAt: number
}

// Invite
export interface Invite {
  id: string
  code: string // 8-char TOTP
  createdBy: string
  expiresAt: number
}

// WebSocket events
export type WsEventType
  = | 'join'
    | 'leave'
    | 'message'
    | 'ack'
    | 'typing'
    | 'key-exchange'

export interface WsEvent<T = unknown> {
  type: WsEventType
  roomId: string
  payload: T
}
