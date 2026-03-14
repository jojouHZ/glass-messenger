import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()

  // Allow login page without check
  if (to.path === '/login') {
    return
  }

  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }
})
