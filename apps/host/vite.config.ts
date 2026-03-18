import { fileURLToPath, URL } from 'node:url'

import { federation } from '@module-federation/vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'

import type { PluginOption } from 'vite'
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  return {
    plugins: [
      VueRouter({
        routesFolder: 'src/pages',
        dts: 'src/typed-router.d.ts',
      }) as PluginOption,
      vue(),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        dts: 'src/auto-imports.d.ts',
      }) as PluginOption,
      federation({
        name: 'host',
        remotes: {
          friends: {
            type: 'module',
            name: 'friends',
            entry: isProd
              ? 'remotes/friends/remoteEntry.js'
              : 'http://localhost:5001/remoteEntry.js',
          },
          chat: {
            type: 'module',
            name: 'chat',
            entry: isProd ? 'remotes/chat/remoteEntry.js' : 'http://localhost:5002/remoteEntry.js',
          },
        },
        shared: {
          vue: { singleton: true, requiredVersion: '^3.5.0' },
          'vue-router': { singleton: true, requiredVersion: '^5.0.3' },
          pinia: { singleton: true, requiredVersion: '^3.0.4' },
        },
      }),
    ],
    resolve: {
      alias: {
        '~': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern' as const,
        },
      },
    },
    server: {
      port: 3000,
      cors: true,
    },
    build: {
      target: 'es2022',
    },
  }
})
