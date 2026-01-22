import { defineStore } from 'pinia'
import { ref } from 'vue'
import { wsClient, type WebSocketMessage, type WebSocketEventType } from '@/core/websocket'

export const useWebSocketStore = defineStore('websocket', () => {
  const isConnected = ref(false)
  const connectionState = ref('disconnected')
  const lastMessage = ref<WebSocketMessage | null>(null)

  let stateInterval: ReturnType<typeof setInterval> | null = null

  // Inicializa conexão e listeners
  function init() {
    // Atualiza estado quando conectar
    wsClient.on('connection_established', () => {
      isConnected.value = true
      connectionState.value = 'connected'
    })

    // Conecta
    wsClient.connect()

    // Monitora estado periodicamente
    if (stateInterval) {
      clearInterval(stateInterval)
    }
    stateInterval = setInterval(() => {
      isConnected.value = wsClient.isConnected
      connectionState.value = wsClient.connectionState
    }, 1000)
  }

  function disconnect() {
    wsClient.disconnect()
    isConnected.value = false
    connectionState.value = 'disconnected'
    if (stateInterval) {
      clearInterval(stateInterval)
      stateInterval = null
    }
  }

  // Expõe métodos do cliente
  function subscribeToConversation(conversationId: string) {
    wsClient.subscribeToConversation(conversationId)
  }

  function unsubscribeFromConversation(conversationId: string) {
    wsClient.unsubscribeFromConversation(conversationId)
  }

  function markAsRead(conversationId: string) {
    wsClient.markAsRead(conversationId)
  }

  function sendTyping(conversationId: string) {
    wsClient.sendTyping(conversationId)
  }

  function on(event: WebSocketEventType, handler: (data: WebSocketMessage) => void) {
    wsClient.on(event, handler)
  }

  function off(event: WebSocketEventType, handler: (data: WebSocketMessage) => void) {
    wsClient.off(event, handler)
  }

  return {
    isConnected,
    connectionState,
    lastMessage,
    init,
    disconnect,
    subscribeToConversation,
    unsubscribeFromConversation,
    markAsRead,
    sendTyping,
    on,
    off
  }
})