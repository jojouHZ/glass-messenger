import Dexie from 'dexie'

import type { Table } from 'dexie'

export interface DbIdentity {
  id: string // userId (ours)
  createdAt: number
  updatedAt: number
}

export interface DbContact {
  id: string // contactId (fingerprint / username / DID)
  displayName: string
  avatarUrl?: string
  lastSeenAt?: number
  createdAt: number
  updatedAt: number
}

export interface DbSession {
  id: string // `${selfId}::${peerId}`
  selfId: string
  peerId: string
  // crypto state (ECDH keys, ratchet state, etc)
  createdAt: number
  updatedAt: number
}

export interface DbMessage {
  id: string // `${conversationId}::${timestamp}::${rand}`
  conversationId: string // sessionId || groupId
  senderId: string
  cipherText: string // payload (JSON string)
  sentAt: number // when we sent (client clock)
  receivedAt?: number // when we received (optional)
  status: 'pending' | 'sent' | 'delivered' | 'read'
}

export class GlassDb extends Dexie {
  identities!: Table<DbIdentity, string>
  contacts!: Table<DbContact, string>
  sessions!: Table<DbSession, string>
  messages!: Table<DbMessage, string>

  constructor() {
    super('glass')

    this.version(1).stores({
      identities: '&id, createdAt, updatedAt',
      contacts: '&id, displayName, lastSeenAt, updatedAt',
      sessions: '&id, selfId, peerId, [selfId+peerId], updatedAt',
      messages: '&id, conversationId, [conversationId+sentAt], senderId, status',
    })
  }
}

export const db = new GlassDb()
