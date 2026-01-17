import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
}

export const useUiStore = defineStore('ui', () => {
  const sidebarCollapsed = ref(false)
  const sidebarMobileOpen = ref(false)
  const loading = ref(false)
  const toasts = ref<Toast[]>([])
  let toastId = 0

  const toggleSidebar = () => sidebarCollapsed.value = !sidebarCollapsed.value
  const toggleMobileSidebar = () => sidebarMobileOpen.value = !sidebarMobileOpen.value
  const closeMobileSidebar = () => sidebarMobileOpen.value = false
  const setLoading = (value: boolean) => loading.value = value

  function addToast(toast: Omit<Toast, 'id'>) {
    const id = ++toastId
    toasts.value.push({ ...toast, id })
    setTimeout(() => removeToast(id), 5000)
    return id
  }

  function removeToast(id: number) {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  const showSuccess = (title: string, message?: string) => addToast({ type: 'success', title, message })
  const showError = (title: string, message?: string) => addToast({ type: 'error', title, message })
  const showWarning = (title: string, message?: string) => addToast({ type: 'warning', title, message })
  const showInfo = (title: string, message?: string) => addToast({ type: 'info', title, message })

  function showToast(title: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
    return addToast({ type, title })
  }

  return {
    sidebarCollapsed, sidebarMobileOpen, loading, toasts,
    toggleSidebar, toggleMobileSidebar, closeMobileSidebar, setLoading,
    addToast, removeToast, showSuccess, showError, showWarning, showInfo, showToast
  }
})

// Alias for compatibility
export const useUIStore = useUiStore
