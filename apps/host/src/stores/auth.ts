import { defineStore } from 'pinia'

import { GLASS_EVENTS } from '@glass/types'

import type { GlassAuthReadyDetail } from '@glass/types'

interface AuthUser {
  id: string
  email: string
}

interface AuthState {
  user: AuthUser | null
  hydrated: boolean
}

const STORAGE_KEY = 'glass-auth-user'

function isClient(): boolean {
  return typeof window !== 'undefined'
}

function loadUserFromStorage(): AuthUser | null {
  if (!isClient()) return null

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<AuthUser>
    if (!parsed || typeof parsed.id !== 'string' || typeof parsed.email !== 'string') {
      return null
    }

    return { id: parsed.id, email: parsed.email }
  } catch {
    return null
  }
}

function saveUserToStorage(user: AuthUser): void {
  if (!isClient()) return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } catch {
    // Ignore storage write failures.
  }
}

function createUserId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `user_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function dispatchAuthReady(user: AuthUser): void {
  if (!isClient()) return

  const detail: GlassAuthReadyDetail = { userId: user.id }
  window.dispatchEvent(new CustomEvent(GLASS_EVENTS.AUTH_READY, { detail }))
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    hydrated: false,
  }),

  getters: {
    isAuthenticated: (state) => state.user !== null,
  },

  actions: {
    hydrateFromStorage() {
      if (this.hydrated) return

      this.user = loadUserFromStorage()
      this.hydrated = true

      if (this.user) {
        dispatchAuthReady(this.user)
      }
    },

    loginMock(email: string) {
      const user: AuthUser = {
        id: createUserId(),
        email,
      }

      this.user = user
      this.hydrated = true
      saveUserToStorage(user)
      dispatchAuthReady(user)
    },

    logout() {
      this.user = null
      this.hydrated = true

      if (!isClient()) return

      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        // Ignore storage cleanup failures.
      }
    },
  },
})
