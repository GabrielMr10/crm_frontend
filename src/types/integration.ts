export type ConnectionState = 'open' | 'close' | 'connecting' | 'not_found' | 'error'

export interface WhatsAppStatus {
  instance: string
  state: ConnectionState
  connected: boolean
  phone_number?: string
  error?: string
}

export interface WhatsAppQRCode {
  instance: string
  base64?: string
  pairingCode?: string
  code?: string
  error?: string
}

export interface WhatsAppConnectResponse {
  instance: string
  status: 'qrcode_ready' | 'already_connected' | 'error'
  qrcode?: WhatsAppQRCode
  connection?: WhatsAppStatus
  message?: string
}

export interface WhatsAppDisconnectResponse {
  instance: string
  status: string
  message?: string
}

export interface IntegrationStatus {
  whatsapp: WhatsAppStatus
  evolution_api: boolean
}