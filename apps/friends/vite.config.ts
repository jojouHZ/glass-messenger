import { federation } from '@module-federation/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'friends',
      filename: 'remoteEntry.js',
      exposes: {
        './FriendsList': './src/components/FriendsList.vue',
      },
      shared: {
        vue: { singleton: true, requiredVersion: '^3.5.0' },
        pinia: { singleton: true, requiredVersion: '^3.0.0' },
      },
      dts: false,
    }),
  ],
  server: {
    port: 5001,
    cors: true,
  },
})
