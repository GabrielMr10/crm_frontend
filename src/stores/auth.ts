import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, Tenant, LoginRequest, RegisterRequest, AuthResponse } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const tenant = ref<Tenant | null>(null)
  const accessToken = ref<string | null>(localStorage.getItem('access_token'))
  const refreshToken = ref<string | null>(localStorage.getItem('refresh_token'))
  const loading = ref(false)
  const error = ref<string | null>(null)
  const initialized = ref(false)

  // Getters
  // isAuthenticated: considera autenticado se tem token (mesmo antes de carregar user)
  const isAuthenticated = computed(() => !!accessToken.value)
  const isReady = computed(() => initialized.value)
  const userFullName = computed(() => user.value?.full_name || '')
  const userInitials = computed(() => {
    const fullName = user.value?.full_name
    if (!fullName) return ''
    const names = fullName.split(' ').filter(n => n.length > 0)
    if (names.length === 0) return ''
    const firstName = names[0] ?? ''
    const lastName = names.length > 1 ? (names[names.length - 1] ?? '') : ''
    if (lastName && firstName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }
    return firstName.charAt(0).toUpperCase()
  })

  // Actions
  function setTokens(access: string, refresh: string) {
    accessToken.value = access
    refreshToken.value = refresh
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
  }

  function clearTokens() {
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  // Lazy import api to avoid circular dependency
  async function getApi() {
    const { default: api } = await import('@/core/api')
    return api
  }

  async function login(credentials: LoginRequest): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const api = await getApi()
      const { data } = await api.post<AuthResponse>('/auth/login', credentials)
      setTokens(data.access_token, data.refresh_token)
      user.value = data.user
      tenant.value = data.tenant
      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erro ao fazer login'
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(data: RegisterRequest): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const api = await getApi()
      const response = await api.post<AuthResponse>('/auth/register', data)
      setTokens(response.data.access_token, response.data.refresh_token)
      user.value = response.data.user
      tenant.value = response.data.tenant
      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erro ao criar conta'
      return false
    } finally {
      loading.value = false
    }
  }

  async function refreshAccessToken(): Promise<boolean> {
    if (!refreshToken.value) return false
    try {
      const api = await getApi()
      const { data } = await api.post('/auth/refresh', { refresh_token: refreshToken.value })
      setTokens(data.access_token, data.refresh_token)
      return true
    } catch {
      clearTokens()
      return false
    }
  }

  async function fetchCurrentUser(): Promise<boolean> {
    if (!accessToken.value) return false
    try {
      const api = await getApi()
      const [userRes, tenantRes] = await Promise.all([
        api.get<User>('/users/me'),
        api.get<Tenant>('/tenants/me')
      ])
      user.value = userRes.data
      tenant.value = tenantRes.data
      return true
    } catch {
      // Token inválido ou expirado - tenta refresh
      const refreshed = await refreshAccessToken()
      if (refreshed) {
        // Tenta novamente após refresh
        try {
          const api = await getApi()
          const [userRes, tenantRes] = await Promise.all([
            api.get<User>('/users/me'),
            api.get<Tenant>('/tenants/me')
          ])
          user.value = userRes.data
          tenant.value = tenantRes.data
          return true
        } catch {
          logout()
          return false
        }
      }
      logout()
      return false
    }
  }

  function logout() {
    user.value = null
    tenant.value = null
    clearTokens()
  }

  async function initialize(): Promise<boolean> {
    if (initialized.value) return isAuthenticated.value

    if (accessToken.value) {
      const success = await fetchCurrentUser()
      initialized.value = true
      return success
    }

    initialized.value = true
    return false
  }

  return {
    user, tenant, accessToken, refreshToken, loading, error, initialized,
    isAuthenticated, isReady, userFullName, userInitials,
    login, register, refreshAccessToken, fetchCurrentUser, logout, initialize
  }
})