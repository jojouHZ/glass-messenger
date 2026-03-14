import Dexie from 'dexie'

import type {Table} from 'dexie';

export interface DbIdentity {
  id: string // userId (ours)
  isCurrent: boolean // active profile (TODO: multi-account)
  createdAt: number  
  updatedAt: number 
}

export type DbContactStatus = 'pending' | 'accepted' | 'blocked'

export interface DbContact {
  id: string // contactId (fingerprint / username / DID)
  displayName: string
  avatarUrl?: string
  publicKeyJwk?: string // public ECDH-key of contact (JSON Web Key)
  status: DbContactStatus
  lastSeenAt?: number // TODO: UI(online/last seen)
  createdAt: number 
  updatedAt: number
}

export interface DbSession {
  id: string // `${selfId}::${peerId}`
  selfId: string 
  peerId: string  
  // crypto state is stored in DbKeyStore
  lastMessageAt?: number
  createdAt: number
  updatedAt: number
}

export type DbMessageType = 'text' | 'image' | 'file' | 'system'

export type DbMessageStatus = 'pending' | 'sent' | 'delivered' | 'read'

export interface DbMessage {
  id: string // `${conversationId}::${timestamp}::${rand}`
  conversationId: string // sessionId || groupId
  senderId: string
  type: DbMessageType
  cipherText: string // encrypted payload (base64 / JSON string)
  sentAt: number // when we sent (client clock)
  receivedAt?: number // when we received (optional)
  status: DbMessageStatus
}

export type DbKeyType = 'identity' | 'session' | 'prekey'

export interface DbKeyStore {
  id: string // 'identity::<userId>' | `session::<sessionId>` | `prekey::<peerId>::<ts>`
  type: DbKeyType
  ownerId?: string // userId for identity keys
  sessionId?: string // session id for session keys
  publicKeyJwk: string // public part is always exportable
  privateKey: CryptoKey // non-extractable CryptoKey
  derivedKey?: CryptoKey // AES-GCM key for sessions
  createdAt: number
  expiresAt?: number
}

export interface DbOutbox {
  id: string // `${conversationId}::${timestamp}::${rand}`
  conversationId: string
  payload: string // encrypted payload ready to send
  createdAt: number
}

export class GlassDb extends Dexie {
  identities!: Table<DbIdentity, string>
  contacts!: Table<DbContact, string>
  sessions!: Table<DbSession, string>
  messages!: Table<DbMessage, string>
  keys!: Table<DbKeyStore, string>
  outbox!: Table<DbOutbox, string>

  constructor() {
    super('glass')

    // v1 schema (initial)
    this.version(1).stores({
      identities: '&id, createdAt, updatedAt',
      contacts: '&id, displayName, lastSeenAt, updatedAt',
      sessions: '&id, selfId, peerId, [selfId+peerId], updatedAt',
      messages:
        '&id, conversationId, [conversationId+sentAt], senderId, status',
    })

    // v2 schema (extended)
    this.version(2)
      .stores({
        identities: '&id, isCurrent, createdAt, updatedAt',
        contacts:
          '&id, status, displayName, lastSeenAt, updatedAt, publicKeyJwk',
        sessions:
          '&id, selfId, peerId, [selfId+peerId], lastMessageAt, updatedAt',
        messages:
          '&id, conversationId, [conversationId+sentAt], senderId, type, status',
        keys: '&id, type, ownerId, sessionId, expiresAt',
        outbox: '&id, conversationId, createdAt',
      })
      .upgrade((tx) => {
        const identities = tx.table<DbIdentity, string>('identities')
        const contacts = tx.table<DbContact, string>('contacts')
        const sessions = tx.table<DbSession, string>('sessions')
        const messages = tx.table<DbMessage, string>('messages')

        identities.toCollection().modify((identity) => {
          if (identity.isCurrent === undefined) {
            identity.isCurrent = true
          }
        })

        contacts.toCollection().modify((contact) => {
          if (contact.status === undefined) {
            contact.status = 'accepted'
          }
        })

        sessions.toCollection().modify((session) => {
          if (session.lastMessageAt === undefined) {
            session.lastMessageAt = session.updatedAt ?? session.createdAt
          }
        })

        messages.toCollection().modify((message) => {
          if ((message as any).type === undefined) {
            ;(message as any).type = 'text'
          }
        })
      })
  }
}

export const db = new GlassDb()
