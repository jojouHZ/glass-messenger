// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  username: string
  publicKey: string // ECDH P-256, base64 SPKI
  createdAt: number
}

// ─── Room ────────────────────────────────────────────────────────────────────

export interface Room {
  id: string
  participantIds: string[]
  createdAt: number
  lastMessageAt?: number
}

// ─── Message ─────────────────────────────────────────────────────────────────

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

// ─── Invite ──────────────────────────────────────────────────────────────────

export interface Invite {
  id: string
  code: string // 8-char TOTP
  createdBy: string
  expiresAt: number
}

// ─── WS Payloads ─────────────────────────────────────────────────────────────

export interface JoinPayload {
  userId: string
  roomId: string
}

export interface LeavePayload {
  userId: string
  roomId: string
}

export interface MessagePayload {
  messageId: string
  senderId: string
  storedPayload: string // AES-GCM, base64
  iv: string // base64
}

export interface AckPayload {
  messageId: string
  status: MessageStatus
}

export interface TypingPayload {
  userId: string
  isTyping: boolean
}

export interface KeyExchangePayload {
  fromUserId: string
  toUserId: string
  publicKey: string // base64 SPKI
}

// ─── WS Events (discriminated union) ─────────────────────────────────────────

export type WsEvent =
  | { type: 'join'; roomId: string; payload: JoinPayload }
  | { type: 'leave'; roomId: string; payload: LeavePayload }
  | { type: 'message'; roomId: string; payload: MessagePayload }
  | { type: 'ack'; roomId: string; payload: AckPayload }
  | { type: 'typing'; roomId: string; payload: TypingPayload }
  | { type: 'key-exchange'; roomId: string; payload: KeyExchangePayload }

export type WsEventType = WsEvent['type']

// MF Event Bus — shared constants & types
export const GLASS_EVENTS = {
  CHAT_OPEN: 'glass:chat-open',
  AUTH_READY: 'glass:auth-ready',
  // TODO: AUTH_CHANGED, INVITE_RECEIVED, FORCE_WIPE…
} as const

export interface GlassChatOpenDetail {
  roomId: string
}

export interface GlassAuthReadyDetail {
  userId: string
  displayName?: string
}

// Helper: typed wrapper to avoid casting at call sites
export type GlassChatOpenEvent = CustomEvent<GlassChatOpenDetail>
