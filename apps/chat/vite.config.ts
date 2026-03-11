import { federation } from '@module-federation/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'chat',
      filename: 'remoteEntry.js',
      exposes: {
        './ChatWindow': './src/components/ChatWindow.vue',
      },
      shared: {
        vue: { singleton: true, requiredVersion: '^3.5.0' },
        pinia: { singleton: true, requiredVersion: '^3.0.0' },
      },
    }),
  ],
  server: {
    port: 5002,
    cors: true,
  },
})
