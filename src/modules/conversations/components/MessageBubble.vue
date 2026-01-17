<script setup lang="ts">
import type { Message } from '@/types'
import { MessageDirection, MessageStatus } from '@/types'
import { Check, CheckCheck, Bot } from 'lucide-vue-next'

const props = defineProps<{ message: Message }>()
const isOutbound = props.message.direction === MessageDirection.OUTBOUND
</script>

<template>
  <div :class="['flex', isOutbound ? 'justify-end' : 'justify-start']">
    <div :class="['max-w-[70%] rounded-2xl px-4 py-2', isOutbound ? 'bg-primary-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-900 rounded-bl-md']">
      <div v-if="message.sent_by_bot && isOutbound" class="flex items-center gap-1 mb-1">
        <Bot class="w-3 h-3" />
        <span class="text-xs opacity-75">Bot</span>
      </div>
      <p class="whitespace-pre-wrap break-words">{{ message.content }}</p>
      <div :class="['flex items-center gap-1 mt-1 text-xs', isOutbound ? 'justify-end opacity-75' : 'text-gray-500']">
        <span>{{ new Date(message.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }}</span>
        <CheckCheck v-if="isOutbound && message.status === MessageStatus.READ" class="w-4 h-4 text-blue-300" />
        <Check v-else-if="isOutbound" class="w-4 h-4" />
      </div>
    </div>
  </div>
</template>
