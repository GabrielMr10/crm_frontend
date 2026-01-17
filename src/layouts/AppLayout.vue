<script setup lang="ts">
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'
import { ToastContainer } from '@/shared/components'
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Sidebar />
    <div :class="['transition-all duration-300', uiStore.sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64']">
      <Navbar />
      <main class="p-6"><slot /></main>
    </div>
    <div v-if="uiStore.sidebarMobileOpen" class="fixed inset-0 bg-black/50 z-40 lg:hidden" @click="uiStore.closeMobileSidebar" />
    <ToastContainer />
  </div>
</template>
