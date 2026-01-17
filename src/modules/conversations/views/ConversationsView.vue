<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useUiStore } from '@/stores/ui'
import AppLayout from '@/layouts/AppLayout.vue'
import ChatList from '../components/ChatList.vue'
import ChatWindow from '../components/ChatWindow.vue'
import { getConversations, getConversation, sendMessage, toggleBot, markAsRead } from '../api'
import type { Conversation, Message } from '@/types'

const uiStore = useUiStore()

const loading = ref(true)
const conversations = ref<Conversation[]>([])
const selectedConversation = ref<Conversation | null>(null)
const messages = ref<Message[]>([])
const loadingMessages = ref(false)
const sendingMessage = ref(false)

let pollingInterval: ReturnType<typeof setInterval> | null = null

async function loadConversations() {
  try {
    const response = await getConversations({ per_page: 50 })
    conversations.value = response.items
  } catch {
    uiStore.showError('Erro', 'Falha ao carregar conversas')
  } finally {
    loading.value = false
  }
}

async function selectConversation(conv: Conversation) {
  selectedConversation.value = conv
  loadingMessages.value = true
  try {
    const fullConv = await getConversation(conv.id)
    messages.value = fullConv.messages || []
    if (conv.is_unread) {
      await markAsRead(conv.id)
      conv.is_unread = false
      conv.unread_count = 0
    }
  } catch {
    uiStore.showError('Erro', 'Falha ao carregar mensagens')
  } finally {
    loadingMessages.value = false
  }
}

async function handleSendMessage(content: string) {
  if (!selectedConversation.value) return
  sendingMessage.value = true
  try {
    const newMessage = await sendMessage(selectedConversation.value.id, { content })
    messages.value.push(newMessage)
    const conv = conversations.value.find(c => c.id === selectedConversation.value?.id)
    if (conv) {
      conv.last_message_text = content
      conv.last_message_at = new Date().toISOString()
    }
  } catch {
    uiStore.showError('Erro', 'Falha ao enviar mensagem')
  } finally {
    sendingMessage.value = false
  }
}

async function handleToggleBot() {
  if (!selectedConversation.value) return
  try {
    const updated = await toggleBot(selectedConversation.value.id)
    selectedConversation.value.is_bot_active = updated.is_bot_active
    const conv = conversations.value.find(c => c.id === updated.id)
    if (conv) conv.is_bot_active = updated.is_bot_active
    uiStore.showSuccess(updated.is_bot_active ? 'Bot ativado' : 'Bot desativado')
  } catch {
    uiStore.showError('Erro', 'Falha ao alterar bot')
  }
}

function startPolling() {
  pollingInterval = setInterval(async () => {
    // Atualiza mensagens da conversa selecionada
    if (selectedConversation.value) {
      try {
        const fullConv = await getConversation(selectedConversation.value.id)
        if (fullConv.messages.length > messages.value.length) {
          messages.value = fullConv.messages
        }
      } catch {
        // Silently fail on polling
      }
    }
    // Atualiza lista de conversas
    try {
      const res = await getConversations({ per_page: 50 })
      conversations.value = res.items
    } catch {
      // Silently fail on polling
    }
  }, 5000)
}

onMounted(() => {
  loadConversations()
  startPolling()
})

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval)
})
</script>

<template>
  <AppLayout>
    <div class="h-[calc(100vh-7rem)] flex rounded-lg overflow-hidden border border-gray-200 bg-white">
      <div class="w-80 flex-shrink-0">
        <ChatList
          :conversations="conversations"
          :selected-id="selectedConversation?.id"
          :loading="loading"
          @select="selectConversation"
        />
      </div>
      <div class="flex-1">
        <ChatWindow
          :conversation="selectedConversation"
          :messages="messages"
          :loading="loadingMessages"
          :sending-message="sendingMessage"
          @send="handleSendMessage"
          @toggle-bot="handleToggleBot"
        />
      </div>
    </div>
  </AppLayout>
</template>
