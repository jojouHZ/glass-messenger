import { federation } from '@module-federation/vite'

export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', 'nuxt-security'],

  css: ['~/assets/styles/main.scss'],

  typescript: {
    strict: true,
    typeCheck: false,
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
    plugins: [
      federation({
        name: 'host',
        remotes: {
          friends: {
            type: 'module',
            name: 'friends',
            entry: 'http://localhost:5001/remoteEntry.js',
          },
          chat: {
            type: 'module',
            name: 'chat',
            entry: 'http://localhost:5002/remoteEntry.js',
          },
        },
        shared: {
          vue: { singleton: true, requiredVersion: '^3.5.0' },
          pinia: { singleton: true, requiredVersion: '^3.0.0' },
        },
      }),
    ],
  },

  security: {
    headers: {
      contentSecurityPolicy: {
        'default-src': ['self'],
        'connect-src': ['self', 'wss:'],
        'script-src': ['self', 'unsafe-inline'],
        'style-src': ['self', 'unsafe-inline'],
      },
    },
  },
})
