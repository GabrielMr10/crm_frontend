import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types'

export const useUsersStore = defineStore('users', () => {
  const users = ref<Map<string, User>>(new Map())
  const loading = ref(false)
  const loaded = ref(false)

  async function loadUsers() {
    if (loaded.value) return
    loading.value = true
    try {
      const { default: api } = await import('@/core/api')
      const { data } = await api.get<User[]>('/users')
      data.forEach(user => users.value.set(user.id, user))
      loaded.value = true
    } catch {
      // Silently fail - user might not have permission
    } finally {
      loading.value = false
    }
  }

  function getUserById(id: string | null): User | null {
    if (!id) return null
    return users.value.get(id) || null
  }

  function getUserName(id: string | null): string {
    const user = getUserById(id)
    return user?.full_name || 'Desconhecido'
  }

  function getUsersList(): User[] {
    return Array.from(users.value.values())
  }

  function reset() {
    users.value.clear()
    loaded.value = false
  }

  return { users, loading, loaded, loadUsers, getUserById, getUserName, getUsersList, reset }
})
