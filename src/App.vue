<script setup lang="ts">
import { watch } from 'vue'
import { ToastContainer } from '@/shared/components'
import { useAuthStore } from '@/stores/auth'
import { useWebSocketStore } from '@/stores/websocket'

const authStore = useAuthStore()
const wsStore = useWebSocketStore()

// Conecta WebSocket quando usuário logar
watch(() => authStore.isAuthenticated, (isAuth) => {
  if (isAuth) {
    wsStore.init()
  } else {
    wsStore.disconnect()
  }
}, { immediate: true })
</script>

<template>
  <RouterView />
  <ToastContainer />
</template>