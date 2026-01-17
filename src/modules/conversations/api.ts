import api from '@/core/api'
import type { Conversation, ConversationWithMessages, Message, MessageCreate, PaginatedResponse } from '@/types'

export async function getConversations(filters: { per_page?: number } = {}): Promise<PaginatedResponse<Conversation>> {
  const params = new URLSearchParams()
  if (filters.per_page) params.append('per_page', String(filters.per_page))
  const { data } = await api.get<PaginatedResponse<Conversation>>(`/conversations?${params}`)
  return data
}

export async function getConversation(id: string): Promise<ConversationWithMessages> {
  const { data } = await api.get<ConversationWithMessages>(`/conversations/${id}`)
  return data
}

export async function sendMessage(conversationId: string, message: MessageCreate): Promise<Message> {
  const { data } = await api.post<Message>(`/conversations/${conversationId}/messages`, message)
  return data
}

export async function markAsRead(conversationId: string): Promise<void> {
  await api.post(`/conversations/${conversationId}/read`)
}

export async function toggleBot(conversationId: string): Promise<Conversation> {
  const { data } = await api.post<Conversation>(`/conversations/${conversationId}/toggle-bot`)
  return data
}
