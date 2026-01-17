export const MessageDirection = {
  INBOUND: 'inbound',
  OUTBOUND: 'outbound'
} as const

export type MessageDirection = typeof MessageDirection[keyof typeof MessageDirection]

export const MessageType = {
  TEXT: 'text',
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
  DOCUMENT: 'document'
} as const

export type MessageType = typeof MessageType[keyof typeof MessageType]

export const MessageStatus = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed'
} as const

export type MessageStatus = typeof MessageStatus[keyof typeof MessageStatus]

export interface Message {
  id: string
  external_id: string | null
  content: string | null
  message_type: MessageType | string
  direction: MessageDirection | string
  status: MessageStatus | string
  media_url: string | null
  sent_by_id: string | null
  sent_by_bot: boolean
  conversation_id: string
  created_at: string
}

export interface Conversation {
  id: string
  phone: string
  contact_name: string | null
  contact_avatar_url: string | null
  is_active: boolean
  is_bot_active: boolean
  is_unread: boolean
  unread_count: number
  last_message_text: string | null
  last_message_at: string | null
  assigned_to_id: string | null
  tags: string[]
  tenant_id: string
  lead_id: string | null
  created_at: string
  updated_at: string
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[]
}

export interface MessageCreate {
  content: string
  message_type?: MessageType | string
}