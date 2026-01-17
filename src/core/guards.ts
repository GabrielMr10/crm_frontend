import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { UserRole } from '@/types'

export function requireRole(roles: UserRole[]) {
  return (_to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const authStore = useAuthStore()
    if (authStore.user && roles.includes(authStore.user.role as UserRole)) {
      next()
    } else {
      next({ name: 'dashboard' })
    }
  }
}
