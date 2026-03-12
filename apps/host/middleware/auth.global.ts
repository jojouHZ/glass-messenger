import { useAuthStore } from '@/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  // Pinia + localStorage недоступны на сервере
  if (import.meta.server) return

  const auth = useAuthStore()

  if (!auth.user && to.path !== '/login') {
    return navigateTo('/login')
  }

  if (auth.user && to.path === '/login') {
    return navigateTo('/')
  }
})
