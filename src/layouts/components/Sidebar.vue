<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { LayoutDashboard, Users, Kanban, MessageSquare, Bot, Settings, ChevronLeft, ChevronRight, X } from 'lucide-vue-next'

const route = useRoute()
const uiStore = useUiStore()
const authStore = useAuthStore()

const menuItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Leads', path: '/leads', icon: Users },
  { name: 'Pipeline', path: '/pipeline', icon: Kanban },
  { name: 'Conversas', path: '/conversations', icon: MessageSquare },
  { name: 'AI Agent', path: '/ai-agent', icon: Bot },
  { name: 'Config', path: '/settings', icon: Settings },
]

const isActive = (path: string) => path === '/' ? route.path === '/' : route.path.startsWith(path)

const sidebarClasses = computed(() => {
  const base = 'fixed top-0 left-0 h-full bg-gray-900 text-white z-50 transition-all duration-300'
  if (uiStore.sidebarMobileOpen) return `${base} w-64 translate-x-0`
  return `${base} ${uiStore.sidebarCollapsed ? 'w-20' : 'w-64'} -translate-x-full lg:translate-x-0`
})
</script>

<template>
  <aside :class="sidebarClasses">
    <div class="h-16 flex items-center justify-between px-4 border-b border-gray-800">
      <div v-if="!uiStore.sidebarCollapsed" class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center font-bold">C</div>
        <span class="font-semibold">CRM</span>
      </div>
      <div v-else class="w-full flex justify-center">
        <div class="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center font-bold">C</div>
      </div>
      <button class="lg:hidden p-1 hover:bg-gray-800 rounded" @click="uiStore.closeMobileSidebar"><X class="w-5 h-5" /></button>
    </div>

    <nav class="p-4 space-y-1">
      <RouterLink v-for="item in menuItems" :key="item.path" :to="item.path"
        :class="['flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
          isActive(item.path) ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white']"
        @click="uiStore.closeMobileSidebar">
        <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
        <span v-if="!uiStore.sidebarCollapsed">{{ item.name }}</span>
      </RouterLink>
    </nav>

    <div v-if="!uiStore.sidebarCollapsed" class="absolute bottom-4 left-4 right-4">
      <div class="p-3 bg-gray-800 rounded-lg">
        <p class="text-sm font-medium truncate">{{ authStore.tenant?.name }}</p>
        <p class="text-xs text-gray-400">{{ authStore.tenant?.plan || 'Free' }}</p>
      </div>
    </div>

    <button class="hidden lg:flex absolute bottom-4 right-0 translate-x-1/2 w-6 h-6 bg-gray-800 border border-gray-700 rounded-full items-center justify-center hover:bg-gray-700"
      @click="uiStore.toggleSidebar">
      <ChevronLeft v-if="!uiStore.sidebarCollapsed" class="w-4 h-4" />
      <ChevronRight v-else class="w-4 h-4" />
    </button>
  </aside>
</template>
