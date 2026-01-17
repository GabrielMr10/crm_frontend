<script setup lang="ts">
import type { Conversation } from '@/types'
import { formatPhone, formatRelativeTime } from '@/shared/utils/formatters'
import { MessageSquare, Bot } from 'lucide-vue-next'

defineProps<{
  conversations: Conversation[]
  selectedId?: string
  loading?: boolean
}>()

const emit = defineEmits<{ (e: 'select', conversation: Conversation): void }>()

function getInitials(name: string | null): string {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}
</script>

<template>
  <div class="h-full flex flex-col bg-white border-r">
    <div class="p-4 border-b">
      <h2 class="text-lg font-semibold">Conversas</h2>
    </div>

    <div class="p-3 border-b">
      <input type="text" placeholder="Buscar..." class="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white" />
    </div>

    <div class="flex-1 overflow-y-auto">
      <div v-if="loading" class="p-4 text-center text-gray-500">Carregando...</div>
      <div v-else-if="!conversations.length" class="p-4 text-center text-gray-500">
        <MessageSquare class="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>Nenhuma conversa</p>
      </div>
      <button v-else v-for="conv in conversations" :key="conv.id" @click="emit('select', conv)"
        :class="['w-full p-3 flex items-start gap-3 hover:bg-gray-50 text-left border-b transition-colors', conv.id === selectedId ? 'bg-primary-50' : '']">
        <div class="relative">
          <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-medium text-gray-600">
            {{ getInitials(conv.contact_name) }}
          </div>
          <div v-if="conv.is_bot_active" class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <Bot class="w-3 h-3 text-white" />
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between mb-1">
            <span class="font-medium truncate">{{ conv.contact_name || formatPhone(conv.phone) }}</span>
            <span class="text-xs text-gray-500 flex-shrink-0">{{ formatRelativeTime(conv.last_message_at) }}</span>
          </div>
          <p class="text-sm text-gray-500 truncate">{{ conv.last_message_text || 'Sem mensagens' }}</p>
          <span v-if="conv.unread_count" class="inline-block mt-1 px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
            {{ conv.unread_count }}
          </span>
        </div>
      </button>
    </div>
  </div>
</template>
