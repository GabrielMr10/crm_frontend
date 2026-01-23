<script setup lang="ts">
import { computed } from 'vue'
import type { ConnectionState } from '@/types'
import { CheckCircle, XCircle, Loader2, AlertCircle, HelpCircle } from 'lucide-vue-next'

const props = defineProps<{
  state: ConnectionState
  phoneNumber?: string
}>()

const statusConfig = computed(() => {
  const configs: Record<ConnectionState, { label: string; color: string; icon: any; bg: string }> = {
    open: {
      label: 'Conectado',
      color: 'text-green-600',
      icon: CheckCircle,
      bg: 'bg-green-100'
    },
    close: {
      label: 'Desconectado',
      color: 'text-red-600',
      icon: XCircle,
      bg: 'bg-red-100'
    },
    connecting: {
      label: 'Conectando...',
      color: 'text-yellow-600',
      icon: Loader2,
      bg: 'bg-yellow-100'
    },
    not_found: {
      label: 'Nao configurado',
      color: 'text-gray-600',
      icon: HelpCircle,
      bg: 'bg-gray-100'
    },
    error: {
      label: 'Erro',
      color: 'text-red-600',
      icon: AlertCircle,
      bg: 'bg-red-100'
    }
  }

  return configs[props.state] || configs.not_found
})

const isConnecting = computed(() => props.state === 'connecting')
</script>

<template>
  <div class="flex items-center gap-3">
    <div :class="['w-10 h-10 rounded-full flex items-center justify-center', statusConfig.bg]">
      <component
        :is="statusConfig.icon"
        :class="['w-5 h-5', statusConfig.color, { 'animate-spin': isConnecting }]"
      />
    </div>
    <div>
      <p :class="['font-medium', statusConfig.color]">
        {{ statusConfig.label }}
      </p>
      <p v-if="phoneNumber" class="text-sm text-gray-500">
        {{ phoneNumber }}
      </p>
    </div>
  </div>
</template>