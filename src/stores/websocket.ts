import { defineStore } from 'pinia'
import { ref } from 'vue'
import { wsClient, type WebSocketMessage, type WebSocketEventType } from '@/core/websocket'

export const useWebSocketStore = defineStore('websocket', () => {
  const isConnected = ref(false)
  const connectionState = ref('disconnected')
  const lastMessage = ref<WebSocketMessage | null>(null)

  let stateInterval: ReturnType<typeof setInterval> | null = null

  // Inicializa conexao e listeners
  function init() {
    // 1. Listener de conexao estabelecida
    wsClient.on('connection_established', () => {
      isConnected.value = true
      connectionState.value = 'connected'
      console.log('[WS Store] WebSocket Conectado!')
    })

    // 2. Listener para nova mensagem (logging centralizado)
    wsClient.on('new_message', (data: WebSocketMessage) => {
      console.log('[WS Store] new_message:', data)
      lastMessage.value = data
    })

    // 3. Listener para conversa atualizada
    wsClient.on('conversation_updated', (data: WebSocketMessage) => {
      console.log('[WS Store] conversation_updated:', data)
      lastMessage.value = data
    })

    // 4. Listener para status de mensagem
    wsClient.on('message_status_updated', (data: WebSocketMessage) => {
      console.log('[WS Store] message_status_updated:', data)
      lastMessage.value = data
    })

    // 5. Listener para status do WhatsApp
    wsClient.on('whatsapp_connection_update', (data: WebSocketMessage) => {
      console.log('[WS Store] whatsapp_connection_update:', data)
      lastMessage.value = data
    })

    // 6. Fallback: eventos da Evolution API (caso backend repasse direto)
    wsClient.on('MESSAGES_UPSERT', (data: WebSocketMessage) => {
      console.log('[WS Store] MESSAGES_UPSERT (Evolution fallback):', data)
      lastMessage.value = data
    })

    wsClient.on('MESSAGES_UPDATE', (data: WebSocketMessage) => {
      console.log('[WS Store] MESSAGES_UPDATE (Evolution fallback):', data)
      lastMessage.value = data
    })

    wsClient.on('CONNECTION_UPDATE', (data: WebSocketMessage) => {
      console.log('[WS Store] CONNECTION_UPDATE (Evolution fallback):', data)
      lastMessage.value = data
    })

    // 7. Conecta
    wsClient.connect()

    // 8. Monitora estado periodicamente
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

  // Expoe metodos do cliente
  function subscribeToConversation(conversationId: string) {
    console.log('[WS Store] Inscrevendo na conversa:', conversationId)
    wsClient.subscribeToConversation(conversationId)
  }

  function unsubscribeFromConversation(conversationId: string) {
    console.log('[WS Store] Desinscrevendo da conversa:', conversationId)
    wsClient.unsubscribeFromConversation(conversationId)
  }

  function markAsRead(conversationId: string) {
    wsClient.markAsRead(conversationId)
  }

  function sendTyping(conversationId: string) {
    wsClient.sendTyping(conversationId)
  }

  function on(event: WebSocketEventType, handler: (data: WebSocketMessage) => void) {
    console.log('[WS Store] Registrando handler para:', event)
    wsClient.on(event, handler)
  }

  function off(event: WebSocketEventType, handler: (data: WebSocketMessage) => void) {
    console.log('[WS Store] Removendo handler para:', event)
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