<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import type { Conversation, Message } from '@/types'
import MessageBubble from './MessageBubble.vue'
import { formatPhone } from '@/shared/utils/formatters'
import { Send, Bot, BotOff, Phone, Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  conversation: Conversation | null
  messages: Message[]
  loading?: boolean
  sendingMessage?: boolean
}>()

const emit = defineEmits<{
  (e: 'send', content: string): void
  (e: 'toggle-bot'): void
}>()

const messageInput = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const canSend = computed(() => messageInput.value.trim().length > 0)

function sendMessage() {
  if (!canSend.value || props.sendingMessage) return
  emit('send', messageInput.value.trim())
  messageInput.value = ''
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

watch(() => props.messages, scrollToBottom, { deep: true })
watch(() => props.conversation?.id, scrollToBottom)
</script>

<template>
  <div class="h-full flex flex-col bg-gray-50">
    <div v-if="!conversation" class="flex-1 flex items-center justify-center text-gray-500">
      <div class="text-center">
        <Phone class="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p>Selecione uma conversa</p>
      </div>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="bg-white border-b p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
          {{ (conversation.contact_name ?? '?').charAt(0).toUpperCase() }}
        </div>
        <div class="flex-1">
          <h3 class="font-semibold">{{ conversation.contact_name || formatPhone(conversation.phone) }}</h3>
          <p class="text-sm text-gray-500">{{ formatPhone(conversation.phone) }}</p>
        </div>
        <button @click="emit('toggle-bot')"
          :class="['p-2 rounded-lg transition-colors', conversation.is_bot_active ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
          :title="conversation.is_bot_active ? 'Bot ativo - Clique para desativar' : 'Bot inativo - Clique para ativar'">
          <Bot v-if="conversation.is_bot_active" class="w-5 h-5" />
          <BotOff v-else class="w-5 h-5" />
        </button>
      </div>

      <!-- Messages -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3">
        <div v-if="loading" class="flex justify-center py-4">
          <Loader2 class="w-6 h-6 text-primary-600 animate-spin" />
        </div>
        <div v-else-if="!messages.length" class="text-center text-gray-500 py-8">
          Nenhuma mensagem ainda
        </div>
        <MessageBubble v-else v-for="msg in messages" :key="msg.id" :message="msg" />
      </div>

      <!-- Input -->
      <div class="bg-white border-t p-4">
        <div class="flex items-end gap-3">
          <textarea
            v-model="messageInput"
            @keydown.enter.exact.prevent="sendMessage"
            placeholder="Digite sua mensagem..."
            rows="1"
            class="flex-1 px-4 py-3 bg-gray-100 rounded-2xl resize-none max-h-32 focus:ring-2 focus:ring-primary-500 focus:bg-white"
          />
          <button
            @click="sendMessage"
            :disabled="!canSend || sendingMessage"
            :class="['p-3 rounded-full transition-colors', canSend && !sendingMessage ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-200 text-gray-400']"
          >
            <Loader2 v-if="sendingMessage" class="w-5 h-5 animate-spin" />
            <Send v-else class="w-5 h-5" />
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
