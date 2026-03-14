export default defineNuxtConfig({
  compatibilityDate: '2026-03-11',
  devtools: { enabled: true },

  ssr: false,

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
      
    ],
  },

  security: {
    headers: {
      contentSecurityPolicy: {
        'default-src': ["'self'"],
        'connect-src': ["'self'", 'wss:'],
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"],
      },
    },
  },
})
