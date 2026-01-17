import api from '@/core/api'
import type { Lead, LeadCreate, LeadUpdate, LeadStatus, PaginatedResponse } from '@/types'

export interface LeadFilters {
  page?: number
  per_page?: number
  status?: LeadStatus
  source?: string
  search?: string
  assigned_to_id?: string
  temperature?: string
}

export interface LeadStats {
  total: number
  by_status: Record<string, number>
  by_source: Record<string, number>
}

export async function getLeads(filters: LeadFilters = {}): Promise<PaginatedResponse<Lead>> {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.append(key, String(value))
  })
  const { data } = await api.get<PaginatedResponse<Lead>>(`/leads?${params}`)
  return data
}

export async function getLead(id: string): Promise<Lead> {
  const { data } = await api.get<Lead>(`/leads/${id}`)
  return data
}

export async function createLead(lead: LeadCreate): Promise<Lead> {
  const { data } = await api.post<Lead>('/leads', lead)
  return data
}

export async function updateLead(id: string, lead: LeadUpdate): Promise<Lead> {
  const { data } = await api.patch<Lead>(`/leads/${id}`, lead)
  return data
}

export async function deleteLead(id: string): Promise<void> {
  await api.delete(`/leads/${id}`)
}

export async function getLeadStats(): Promise<LeadStats> {
  const { data } = await api.get<LeadStats>('/leads/stats')
  return data
}

export async function getLeadByPhone(phone: string): Promise<Lead | null> {
  try {
    const { data } = await api.get<Lead>(`/leads/by-phone/${phone}`)
    return data
  } catch {
    return null
  }
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<Lead> {
  const { data } = await api.patch<Lead>(`/leads/${id}/status`, { status })
  return data
}

export async function assignLead(id: string, assignedToId: string | null): Promise<Lead> {
  const { data } = await api.patch<Lead>(`/leads/${id}/assign`, { assigned_to_id: assignedToId })
  return data
}
