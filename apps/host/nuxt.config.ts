export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', 'nuxt-security'],

  css: ['~/assets/styles/main.scss'],

  compatibilityDate: '2025-01-01',

  typescript: {
    strict: true,
    typeCheck: false,
  },

  nitro: {
    experimental: {
      websocket: true,
    },
  },

  security: {
    headers: {
      contentSecurityPolicy: {
        'default-src': ['\'self\''],
        'connect-src': ['\'self\'', 'wss:'],
        'script-src': ['\'self\'', '\'unsafe-inline\''],
        'style-src': ['\'self\'', '\'unsafe-inline\''],
      },
    },
  },
})
