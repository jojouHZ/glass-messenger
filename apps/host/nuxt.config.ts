import { federation } from '@module-federation/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-03-11',
  devtools: { enabled: false },

  ssr: false,

  modules: ['@pinia/nuxt', 'nuxt-security'],

  css: ['~/assets/styles/main.scss'],

  typescript: {
    strict: true,
    typeCheck: false,
  },

  runtimeConfig: {
    public: {
      wsUrl: import.meta.env.NUXT_PUBLIC_WS_URL || '',
    },
  },

  nitro: {
    experimental: {
      websocket: true,
    },
    esbuild: {
      options: {
        target: 'es2022',
      },
    },
  },

  vite: {
    ssr: {
      noExternal: ['pinia'],
      external: ['@module-federation/vite'],
    },
    optimizeDeps: {
      include: ['pinia'],
    },
    plugins: [
      federation({
        name: 'host',
        remotes: {
          friends: {
            type: 'module',
            name: 'friends',
            entry: import.meta.env.PROD
              ? 'remotes/friends/remoteEntry.js'
              : 'http://localhost:5001/remoteEntry.js',
          },
          chat: {
            type: 'module',
            name: 'chat',
            entry: import.meta.env.PROD
              ? 'remotes/chat/remoteEntry.js'
              : 'http://localhost:5002/remoteEntry.js',
          },
        },
        //shared: { vue: { singleton: true },  pinia: { singleton: true },},
      }),
    ],
  },

  security: {
    headers: {
      contentSecurityPolicy: {
        'default-src': ["'self'", 'http://localhost:5001', 'http://localhost:5002'],
        'connect-src': ["'self'", 'ws:', 'wss:', 'http://127.0.0.1:16322'],
        'script-src': [
          "'self'",
          "'unsafe-inline'",
          'http://localhost:5001',
          'http://localhost:5002',
        ],
        'style-src': ["'self'", "'unsafe-inline'"],
      },
    },
  },
})
