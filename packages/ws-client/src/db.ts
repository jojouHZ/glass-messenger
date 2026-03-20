import Dexie from 'dexie'

import type { Table } from 'dexie'

// ─── Identities ───────────────────────────────────────────────────────────────

export interface DbIdentity {
  id: string // userId (ours)
  isCurrent: boolean
  createdAt: number
  updatedAt: number
}

// ─── Contacts ─────────────────────────────────────────────────────────────────

export type DbContactStatus = 'pending' | 'accepted' | 'blocked'

export interface DbContact {
  id: string
  displayName: string
  avatarUrl?: string
  publicKeyJwk?: string // ECDH public key of contact
  status: DbContactStatus
  lastSeenAt?: number
  createdAt: number
  updatedAt: number
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export interface DbSession {
  id: string // `${selfId}::${peerId}`
  selfId: string
  peerId: string
  lastMessageAt?: number
  createdAt: number
  updatedAt: number
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export type DbMessageType = 'text' | 'image' | 'file' | 'system'

export type DbMessageStatus = 'pending' | 'sent' | 'delivered' | 'read'

export interface DbMessage {
  id: string // `${conversationId}::${sentAt}::${rand}`
  conversationId: string
  senderId: string
  type: DbMessageType
  cipherText: string // Phase 2: plaintext; Phase 4: AES-GCM base64
  sentAt: number
  receivedAt?: number
  status: DbMessageStatus
}

type LegacyDbMessage = DbMessage & {
  type?: DbMessageType
}

// ─── Keys ─────────────────────────────────────────────────────────────────────

export type DbKeyType = 'identity' | 'session' | 'prekey'

export interface DbKeyStore {
  id: string // `identity::<userId>` | `session::<sessionId>` | `prekey::<peerId>::<ts>`
  type: DbKeyType
  ownerId?: string
  sessionId?: string
  publicKeyJwk: string // always exportable
  privateKey: CryptoKey // non-extractable, stored via structured clone
  derivedKey?: CryptoKey // AES-GCM derived key for sessions
  createdAt: number
  expiresAt?: number
}

// ─── Outbox (WAL) ─────────────────────────────────────────────────────────────

export interface DbOutbox {
  id: string // same as messageId — deduplication key
  messageId: string // FK → DbMessage.id
  conversationId: string
  payload: string // ready-to-send payload (Phase 2: plaintext, Phase 4: encrypted)
  createdAt: number
}

// ─── Database ─────────────────────────────────────────────────────────────────

export class GlassDb extends Dexie {
  identities!: Table<DbIdentity, string>
  contacts!: Table<DbContact, string>
  sessions!: Table<DbSession, string>
  messages!: Table<DbMessage, string>
  keys!: Table<DbKeyStore, string>
  outbox!: Table<DbOutbox, string>

  constructor() {
    super('glass')

    this.version(1).stores({
      identities: '&id, createdAt, updatedAt',
      contacts: '&id, displayName, lastSeenAt, updatedAt',
      sessions: '&id, selfId, peerId, [selfId+peerId], updatedAt',
      messages: '&id, conversationId, [conversationId+sentAt], senderId, status',
    })

    this.version(2)
      .stores({
        identities: '&id, isCurrent, createdAt, updatedAt',
        contacts: '&id, status, displayName, lastSeenAt, updatedAt, publicKeyJwk',
        sessions: '&id, selfId, peerId, [selfId+peerId], lastMessageAt, updatedAt',
        messages: '&id, conversationId, [conversationId+sentAt], senderId, type, status',
        keys: '&id, type, ownerId, sessionId, expiresAt',
        outbox: '&id, conversationId, createdAt',
      })
      .upgrade((tx) => {
        tx.table<DbIdentity, string>('identities')
          .toCollection()
          .modify((identity) => {
            if (identity.isCurrent === undefined) identity.isCurrent = true
          })

        tx.table<DbContact, string>('contacts')
          .toCollection()
          .modify((contact) => {
            if (contact.status === undefined) contact.status = 'accepted'
          })

        tx.table<DbSession, string>('sessions')
          .toCollection()
          .modify((session) => {
            if (session.lastMessageAt === undefined) {
              session.lastMessageAt = session.updatedAt ?? session.createdAt
            }
          })

        tx.table<DbMessage, string>('messages')
          .toCollection()
          .modify((message) => {
            const legacyMessage = message as LegacyDbMessage
            if (legacyMessage.type === undefined) {
              legacyMessage.type = 'text'
            }
          })
      })

    // v3: outbox gains messageId for WAL ack correlation
    this.version(3)
      .stores({
        identities: '&id, isCurrent, createdAt, updatedAt',
        contacts: '&id, status, displayName, lastSeenAt, updatedAt, publicKeyJwk',
        sessions: '&id, selfId, peerId, [selfId+peerId], lastMessageAt, updatedAt',
        messages: '&id, conversationId, [conversationId+sentAt], senderId, type, status',
        keys: '&id, type, ownerId, sessionId, expiresAt',
        outbox: '&id, messageId, conversationId, createdAt',
      })
      .upgrade((tx) => {
        // backfill messageId = id for any pre-v3 outbox entries
        tx.table<DbOutbox, string>('outbox')
          .toCollection()
          .modify((entry) => {
            if (!entry.messageId) entry.messageId = entry.id
          })
      })
  }
}

export const db = new GlassDb()
