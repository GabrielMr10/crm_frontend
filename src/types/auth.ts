import type { User } from './user'
import type { Tenant } from './tenant'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  company_name: string
  full_name: string
  email: string
  password: string
  phone?: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: User
  tenant: Tenant
}

export interface RegisterResponse extends AuthResponse {
  message: string
}
