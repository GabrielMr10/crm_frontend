<script setup lang="ts">
import { useUiStore } from '@/stores/ui'
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-vue-next'

const uiStore = useUiStore()
const icons = { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info }
const colors = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200'
}
</script>

<template>
  <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
    <TransitionGroup name="toast">
      <div v-for="toast in uiStore.toasts" :key="toast.id"
        :class="['p-4 rounded-lg border shadow-lg flex items-start gap-3', colors[toast.type]]">
        <component :is="icons[toast.type]" class="w-5 h-5 flex-shrink-0" />
        <div class="flex-1"><p class="font-medium">{{ toast.title }}</p><p v-if="toast.message" class="text-sm mt-1">{{ toast.message }}</p></div>
        <button @click="uiStore.removeToast(toast.id)"><X class="w-4 h-4" /></button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(100%); }
</style>
