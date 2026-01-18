<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { Menu, Bell, LogOut, User, Settings, X } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()
const showMenu = ref(false)
const showNotifications = ref(false)

// Notificações de exemplo (futuramente virá do backend)
const notifications = ref([
  { id: 1, title: 'Novo lead recebido', message: 'João Silva entrou em contato pelo WhatsApp', time: '5 min', read: false },
  { id: 2, title: 'Negócio movido', message: 'Proposta ABC foi movida para Fechamento', time: '1h', read: false },
  { id: 3, title: 'Mensagem nova', message: 'Você tem 3 mensagens não lidas', time: '2h', read: true }
])

const unreadCount = ref(notifications.value.filter(n => !n.read).length)

function toggleNotifications() {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) {
    showMenu.value = false
  }
}

function toggleMenu() {
  showMenu.value = !showMenu.value
  if (showMenu.value) {
    showNotifications.value = false
  }
}

function markAsRead(id: number) {
  const notification = notifications.value.find(n => n.id === id)
  if (notification && !notification.read) {
    notification.read = true
    unreadCount.value = notifications.value.filter(n => !n.read).length
  }
}

function markAllAsRead() {
  notifications.value.forEach(n => n.read = true)
  unreadCount.value = 0
}

function closeAll() {
  showMenu.value = false
  showNotifications.value = false
}

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
    <button class="lg:hidden p-2 hover:bg-gray-100 rounded-lg" @click="uiStore.toggleMobileSidebar">
      <Menu class="w-5 h-5 text-gray-600" />
    </button>

    <div class="flex-1"></div>

    <div class="flex items-center gap-2">
      <!-- Notificações -->
      <div class="relative">
        <button
          class="p-2 hover:bg-gray-100 rounded-lg relative"
          @click="toggleNotifications"
        >
          <Bell class="w-5 h-5 text-gray-600" />
          <span
            v-if="unreadCount > 0"
            class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
          ></span>
        </button>

        <!-- Dropdown de Notificações -->
        <div
          v-if="showNotifications"
          class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50"
        >
          <div class="px-4 py-3 border-b flex items-center justify-between">
            <h3 class="font-semibold text-gray-900">Notificações</h3>
            <button
              v-if="unreadCount > 0"
              @click="markAllAsRead"
              class="text-xs text-primary-600 hover:underline"
            >
              Marcar todas como lidas
            </button>
          </div>

          <div class="max-h-80 overflow-y-auto">
            <div v-if="notifications.length === 0" class="px-4 py-8 text-center text-gray-500">
              Nenhuma notificação
            </div>

            <div
              v-for="notification in notifications"
              :key="notification.id"
              @click="markAsRead(notification.id)"
              :class="[
                'px-4 py-3 border-b last:border-0 cursor-pointer hover:bg-gray-50 transition-colors',
                !notification.read ? 'bg-blue-50/50' : ''
              ]"
            >
              <div class="flex items-start gap-3">
                <div
                  v-if="!notification.read"
                  class="w-2 h-2 bg-primary-500 rounded-full mt-2 shrink-0"
                ></div>
                <div v-else class="w-2 h-2 shrink-0"></div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                  <p class="text-sm text-gray-600 truncate">{{ notification.message }}</p>
                  <p class="text-xs text-gray-400 mt-1">{{ notification.time }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="px-4 py-3 border-t bg-gray-50 rounded-b-lg">
            <button class="text-sm text-primary-600 hover:underline w-full text-center">
              Ver todas as notificações
            </button>
          </div>
        </div>
      </div>

      <!-- Menu do Usuário -->
      <div class="relative">
        <button class="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg" @click="toggleMenu">
          <div class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
            {{ authStore.userInitials }}
          </div>
          <span class="hidden sm:block text-sm font-medium text-gray-700">{{ authStore.userFullName }}</span>
        </button>

        <div v-if="showMenu" class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-1 z-50">
          <div class="px-4 py-3 border-b">
            <p class="text-sm font-medium">{{ authStore.userFullName }}</p>
            <p class="text-xs text-gray-500">{{ authStore.user?.email }}</p>
          </div>
          <RouterLink to="/settings/profile" class="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100" @click="showMenu = false">
            <User class="w-4 h-4" />Meu Perfil
          </RouterLink>
          <RouterLink to="/settings" class="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100" @click="showMenu = false">
            <Settings class="w-4 h-4" />Configurações
          </RouterLink>
          <hr class="my-1" />
          <button @click="logout" class="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
            <LogOut class="w-4 h-4" />Sair
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Overlay para fechar dropdowns -->
  <div
    v-if="showMenu || showNotifications"
    class="fixed inset-0 z-40"
    @click="closeAll"
  />
</template>