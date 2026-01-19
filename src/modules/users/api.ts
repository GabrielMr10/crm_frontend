import api from '@/core/api'
import type { User } from '@/types'

export interface UserCreate {
  email: string
  full_name: string
  password: string
  phone?: string
  role?: 'admin' | 'manager' | 'member'
}

export interface UserUpdate {
  full_name?: string
  phone?: string
  role?: 'admin' | 'manager' | 'member'
}

export async function getUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>('/users')
  return data
}

export async function getUser(id: string): Promise<User> {
  const { data } = await api.get<User>(`/users/${id}`)
  return data
}

export async function createUser(user: UserCreate): Promise<User> {
  const { data } = await api.post<User>('/users', user)
  return data
}

export async function updateUser(id: string, user: UserUpdate): Promise<User> {
  const { data } = await api.patch<User>(`/users/${id}`, user)
  return data
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`)
}

export async function activateUser(id: string): Promise<User> {
  const { data } = await api.post<User>(`/users/${id}/activate`)
  return data
}

export async function deactivateUser(id: string): Promise<User> {
  const { data } = await api.post<User>(`/users/${id}/deactivate`)
  return data
}