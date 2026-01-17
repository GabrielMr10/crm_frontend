<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { Menu, Bell, LogOut, User, Settings } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()
const showMenu = ref(false)

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
      <button class="p-2 hover:bg-gray-100 rounded-lg relative">
        <Bell class="w-5 h-5 text-gray-600" />
        <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>

      <div class="relative">
        <button class="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg" @click="showMenu = !showMenu">
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
            <Settings class="w-4 h-4" />Configuracoes
          </RouterLink>
          <hr class="my-1" />
          <button @click="logout" class="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
            <LogOut class="w-4 h-4" />Sair
          </button>
        </div>
      </div>
    </div>
  </header>
  <div v-if="showMenu" class="fixed inset-0 z-40" @click="showMenu = false" />
</template>
