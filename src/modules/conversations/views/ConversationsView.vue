<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useUiStore } from '@/stores/ui'
import { useUsersStore } from '@/stores/users'
import { useWebSocketStore } from '@/stores/websocket'
import AppLayout from '@/layouts/AppLayout.vue'
import ChatList from '../components/ChatList.vue'
import ChatWindow from '../components/ChatWindow.vue'
import { getConversations, getConversation, sendMessage, toggleBot, markAsRead } from '../api'
import type { Conversation, Message } from '@/types'
import type { WebSocketMessage } from '@/core/websocket'

const uiStore = useUiStore()
const usersStore = useUsersStore()
const wsStore = useWebSocketStore()

const loading = ref(true)
const conversations = ref<Conversation[]>([])
const selectedConversation = ref<Conversation | null>(null)
const messages = ref<Message[]>([])
const loadingMessages = ref(false)
const sendingMessage = ref(false)

// Lista de usuários para o filtro
const usersList = computed(() => usersStore.getUsersList())

// === WebSocket Handlers ===

function handleNewMessage(data: WebSocketMessage) {
  console.log('[Conversations] Nova mensagem:', data)

  // Se é da conversa selecionada, adiciona à lista
  if (selectedConversation.value?.id === data.conversation_id && data.message) {
    // Verifica se a mensagem já existe para evitar duplicatas
    const exists = messages.value.some(m => m.id === data.message.id)
    if (!exists) {
      messages.value.push(data.message)
    }
  }

  // Atualiza a lista de conversas (move para cima, atualiza preview)
  updateConversationInList(data.conversation_id!, {
    last_message_text: data.message?.content,
    last_message_at: data.message?.created_at,
    is_unread: selectedConversation.value?.id !== data.conversation_id,
    unread_count: selectedConversation.value?.id === data.conversation_id
      ? 0
      : (getConversationById(data.conversation_id!)?.unread_count || 0) + 1
  })
}

function handleConversationUpdated(data: WebSocketMessage) {
  console.log('[Conversations] Conversa atualizada:', data)
  if (data.conversation_id) {
    updateConversationInList(data.conversation_id, {
      last_message_text: data.last_message,
      last_message_at: data.last_message_at
    })
  }
}

function handleMessageStatus(data: WebSocketMessage) {
  console.log('[Conversations] Status mensagem:', data)
  if (data.message_id && data.status) {
    const messageIndex = messages.value.findIndex(m => m.id === data.message_id)
    if (messageIndex !== -1 && messages.value[messageIndex]) {
      messages.value[messageIndex].status = data.status
    }
  }
}

// === Helpers ===

function getConversationById(id: string): Conversation | undefined {
  return conversations.value.find(c => c.id === id)
}

function updateConversationInList(id: string, updates: Partial<Conversation>) {
  const index = conversations.value.findIndex(c => c.id === id)
  if (index !== -1) {
    const existing = conversations.value[index]
    if (existing) {
      Object.assign(existing, updates)
      // Move para o topo
      conversations.value.splice(index, 1)
      conversations.value.unshift(existing)
    }
  }
}

// === API Functions ===

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
  // Desinscreve da conversa anterior
  if (selectedConversation.value) {
    wsStore.unsubscribeFromConversation(selectedConversation.value.id)
  }

  selectedConversation.value = conv
  loadingMessages.value = true

  // Inscreve na nova conversa
  wsStore.subscribeToConversation(conv.id)

  try {
    const fullConv = await getConversation(conv.id)
    messages.value = fullConv.messages || []
    if (conv.is_unread) {
      await markAsRead(conv.id)
      conv.is_unread = false
      conv.unread_count = 0
      wsStore.markAsRead(conv.id)
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

// === Lifecycle ===

onMounted(() => {
  // Registra handlers WebSocket
  wsStore.on('new_message', handleNewMessage)
  wsStore.on('conversation_updated', handleConversationUpdated)
  wsStore.on('message_status_updated', handleMessageStatus)

  // Carrega dados iniciais
  loadConversations()
  usersStore.loadUsers()
})

onUnmounted(() => {
  // Remove handlers WebSocket
  wsStore.off('new_message', handleNewMessage)
  wsStore.off('conversation_updated', handleConversationUpdated)
  wsStore.off('message_status_updated', handleMessageStatus)

  // Desinscreve da conversa atual
  if (selectedConversation.value) {
    wsStore.unsubscribeFromConversation(selectedConversation.value.id)
  }
})

// Watch para reconectar quando WebSocket reconecta
watch(() => wsStore.isConnected, (connected) => {
  if (connected && selectedConversation.value) {
    // Reinscreve na conversa atual após reconexão
    wsStore.subscribeToConversation(selectedConversation.value.id)
  }
})
</script>

<template>
  <AppLayout>
    <div class="h-[calc(100vh-7rem)] flex flex-col">
      <!-- Indicador de conexão WebSocket -->
      <div class="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200">
        <div
          :class="[
            'w-2 h-2 rounded-full transition-colors',
            wsStore.isConnected ? 'bg-green-500' : 'bg-red-500'
          ]"
        />
        <span class="text-xs text-gray-500">
          {{ wsStore.isConnected ? 'Conectado em tempo real' : 'Reconectando...' }}
        </span>
      </div>

      <!-- Chat -->
      <div class="flex-1 flex rounded-lg overflow-hidden border border-gray-200 bg-white">
        <div class="w-80 shrink-0">
          <ChatList
            :conversations="conversations"
            :selected-id="selectedConversation?.id"
            :loading="loading"
            :users="usersList"
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
    </div>
  </AppLayout>
</template>