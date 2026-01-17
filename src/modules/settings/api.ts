import api from '@/core/api'
import type { User } from '@/types'

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