export const UserRole = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager',
  MEMBER: 'member'
} as const

export type UserRole = typeof UserRole[keyof typeof UserRole]

export interface User {
  id: string
  email: string
  full_name: string
  name?: string
  phone: string | null
  avatar_url: string | null
  role: UserRole | string
  is_active: boolean
  tenant_id: string
  created_at: string
  updated_at: string
  last_login_at: string | null
}

export interface UserUpdate {
  full_name?: string
  phone?: string
  avatar_url?: string
}

export interface UserChangePassword {
  current_password: string
  new_password: string
}