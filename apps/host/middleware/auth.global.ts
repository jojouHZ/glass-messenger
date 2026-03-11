import { useAuthStore } from '~/stores/auth'

const publicPaths = ['/login']

export default defineNuxtRouteMiddleware((to) => {
  // На сервере пока ничего не делаем
  if (import.meta.server) return

  const auth = useAuthStore()

  if (publicPaths.includes(to.path)) {
    if (auth.isAuthenticated) {
      return navigateTo('/')
    }
    return
  }

  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }
})
