import { defineStore } from 'pinia'

interface AuthUser {
  id: string
  email: string
}

interface AuthState {
  user: AuthUser | null
}

const STORAGE_KEY = 'glass-auth-user'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
  }),

  getters: {
    isAuthenticated: (state) => state.user !== null,
  },

  actions: {
    hydrateFromStorage() {
      if (!import.meta.client) return
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          this.user = JSON.parse(raw) as AuthUser
        }
      } catch {
        this.user = null
      }
    },

    loginMock(email: string) {
      this.user = {
        id: 'mock-user',
        email,
      }
      if (import.meta.client) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.user))
      }
    },

    logout() {
      this.user = null
      if (import.meta.client) {
        localStorage.removeItem(STORAGE_KEY)
      }
    },
  },
})
