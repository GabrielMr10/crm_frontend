import { useAuthStore } from '@/stores/auth'

export type WebSocketEventType =
  | 'connection_established'
  | 'new_message'
  | 'conversation_updated'
  | 'message_status_updated'
  | 'conversation_assigned'
  | 'user_typing'
  | 'messages_read'
  | 'subscribed'
  | 'unsubscribed'
  | 'pong'

export interface WebSocketMessage {
  type: WebSocketEventType
  conversation_id?: string
  message?: any
  [key: string]: any
}

type MessageHandler = (data: WebSocketMessage) => void

class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private handlers: Map<WebSocketEventType, Set<MessageHandler>> = new Map()
  private pingInterval: ReturnType<typeof setInterval> | null = null
  private isConnecting = false

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  get connectionState(): string {
    if (!this.ws) return 'disconnected'
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting'
      case WebSocket.OPEN: return 'connected'
      case WebSocket.CLOSING: return 'closing'
      case WebSocket.CLOSED: return 'disconnected'
      default: return 'unknown'
    }
  }

  connect(): void {
    if (this.isConnecting || this.isConnected) {
      console.log('[WS] Já conectado ou conectando')
      return
    }

    const authStore = useAuthStore()
    const token = authStore.accessToken

    if (!token) {
      console.error('[WS] Token não disponível')
      return
    }

    this.isConnecting = true

    // Monta URL do WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
    const host = apiUrl.replace(/^https?:\/\//, '').replace(/\/api\/v1$/, '')
    const wsUrl = `${protocol}//${host}/api/v1/ws?token=${token}`

    console.log('[WS] Conectando...', wsUrl.replace(token, '***'))

    try {
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('[WS] Conectado!')
        this.isConnecting = false
        this.reconnectAttempts = 0
        this.startPing()
      }

      this.ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data)
          console.log('[WS] Mensagem recebida:', data.type)
          this.handleMessage(data)
        } catch (e) {
          console.error('[WS] Erro ao parsear mensagem:', e)
        }
      }

      this.ws.onclose = (event) => {
        console.log('[WS] Desconectado:', event.code, event.reason)
        this.isConnecting = false
        this.stopPing()
        this.attemptReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('[WS] Erro:', error)
        this.isConnecting = false
      }
    } catch (e) {
      console.error('[WS] Erro ao criar conexão:', e)
      this.isConnecting = false
    }
  }

  disconnect(): void {
    this.stopPing()
    if (this.ws) {
      this.ws.close(1000, 'Desconexão manual')
      this.ws = null
    }
    this.reconnectAttempts = this.maxReconnectAttempts // Evita reconexão
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WS] Máximo de tentativas de reconexão atingido')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    console.log(`[WS] Tentando reconectar em ${delay}ms (tentativa ${this.reconnectAttempts})`)

    setTimeout(() => {
      this.connect()
    }, delay)
  }

  private startPing(): void {
    this.pingInterval = setInterval(() => {
      this.send({ type: 'ping' })
    }, 30000) // Ping a cada 30 segundos
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  send(data: object): void {
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.warn('[WS] Não conectado, não foi possível enviar:', data)
    }
  }

  // === Métodos de alto nível ===

  subscribeToConversation(conversationId: string): void {
    this.send({
      type: 'subscribe_conversation',
      conversation_id: conversationId
    })
  }

  unsubscribeFromConversation(conversationId: string): void {
    this.send({
      type: 'unsubscribe_conversation',
      conversation_id: conversationId
    })
  }

  markAsRead(conversationId: string): void {
    this.send({
      type: 'mark_as_read',
      conversation_id: conversationId
    })
  }

  sendTyping(conversationId: string): void {
    this.send({
      type: 'typing',
      conversation_id: conversationId
    })
  }

  // === Event Handlers ===

  on(event: WebSocketEventType, handler: MessageHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler)
  }

  off(event: WebSocketEventType, handler: MessageHandler): void {
    this.handlers.get(event)?.delete(handler)
  }

  private handleMessage(data: WebSocketMessage): void {
    const handlers = this.handlers.get(data.type)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data)
        } catch (e) {
          console.error('[WS] Erro no handler:', e)
        }
      })
    }
  }
}

// Instância singleton
export const wsClient = new WebSocketClient()