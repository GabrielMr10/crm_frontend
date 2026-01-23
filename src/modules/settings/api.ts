import api from '@/core/api'
import type {
  User,
  WhatsAppStatus,
  WhatsAppConnectResponse,
  WhatsAppQRCode,
  WhatsAppDisconnectResponse,
  IntegrationStatus
} from '@/types'

export interface ProfileUpdate {
  name: string
  email: string
  phone?: string
}

export interface PasswordChange {
  current_password: string
  new_password: string
}

export async function getProfile(): Promise<User> {
  const { data } = await api.get<User>('/users/me')
  return data
}

export async function updateProfile(payload: ProfileUpdate): Promise<User> {
  const { data } = await api.put<User>('/users/me', payload)
  return data
}

export async function changePassword(payload: PasswordChange): Promise<void> {
  await api.post('/users/me/change-password', payload)
}

// === WHATSAPP INTEGRATION ===

export async function getWhatsAppStatus(): Promise<WhatsAppStatus> {
  const { data } = await api.get<WhatsAppStatus>('/integrations/whatsapp/status')
  return data
}

export async function connectWhatsApp(): Promise<WhatsAppConnectResponse> {
  const { data } = await api.post<WhatsAppConnectResponse>('/integrations/whatsapp/connect')
  return data
}

export async function refreshQRCode(): Promise<WhatsAppQRCode> {
  const { data } = await api.post<WhatsAppQRCode>('/integrations/whatsapp/qrcode/refresh')
  return data
}

export async function disconnectWhatsApp(): Promise<WhatsAppDisconnectResponse> {
  const { data } = await api.post<WhatsAppDisconnectResponse>('/integrations/whatsapp/disconnect')
  return data
}

export async function deleteWhatsAppInstance(): Promise<WhatsAppDisconnectResponse> {
  const { data } = await api.delete<WhatsAppDisconnectResponse>('/integrations/whatsapp/instance')
  return data
}

export async function getIntegrationsStatus(): Promise<IntegrationStatus> {
  const { data } = await api.get<IntegrationStatus>('/integrations/status')
  return data
}