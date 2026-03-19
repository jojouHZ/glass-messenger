/* eslint-disable import-x/no-cycle */

import { defineNitroConfig } from 'nitropack'

export default defineNitroConfig({
  compatibilityDate: '2026-03-19',
  srcDir: 'server',
  typescript: { strict: true },
  experimental: { websocket: true },
  runtimeConfig: {
    relay: { allowedOrigins: [] },
  },
})
