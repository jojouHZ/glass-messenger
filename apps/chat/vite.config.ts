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
        vue: { singleton: true, requiredVersion: '^3.5.0', eager: true } as any,
      },
      dts: false,
    }),
  ],
  server: {
    port: 5002,
    cors: true,
  },
})
