import '~/assets/styles/main.scss'

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'

import { createPinia } from 'pinia'

import App from './App.vue'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

const auth = useAuthStore(pinia)
auth.hydrateFromStorage() // restore user + dispatch AUTH_READY on cold start

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  if (to.path !== '/login' && !auth.isAuthenticated) {
    return '/login'
  }
})

app.use(router)
app.mount('#app')
