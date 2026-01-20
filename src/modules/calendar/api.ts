import api from '@/core/api'
import type { Appointment, AppointmentCreate, AppointmentUpdate } from '@/types'

export interface AppointmentFilters {
  start_date?: string
  end_date?: string
  lead_id?: string
  assigned_to?: string
  type?: string
  status?: string
}

export async function getAppointments(filters?: AppointmentFilters): Promise<Appointment[]> {
  const { data } = await api.get<Appointment[]>('/appointments', { params: filters })
  return data
}

export async function getAppointment(id: string): Promise<Appointment> {
  const { data } = await api.get<Appointment>(`/appointments/${id}`)
  return data
}

export async function createAppointment(appointment: AppointmentCreate): Promise<Appointment> {
  const { data } = await api.post<Appointment>('/appointments', appointment)
  return data
}

export async function updateAppointment(id: string, appointment: AppointmentUpdate): Promise<Appointment> {
  const { data } = await api.patch<Appointment>(`/appointments/${id}`, appointment)
  return data
}

export async function deleteAppointment(id: string): Promise<void> {
  await api.delete(`/appointments/${id}`)
}

export async function confirmAppointment(id: string): Promise<Appointment> {
  const { data } = await api.post<Appointment>(`/appointments/${id}/confirm`)
  return data
}

export async function cancelAppointment(id: string): Promise<Appointment> {
  const { data } = await api.post<Appointment>(`/appointments/${id}/cancel`)
  return data
}

export async function completeAppointment(id: string): Promise<Appointment> {
  const { data } = await api.post<Appointment>(`/appointments/${id}/complete`)
  return data
}

export async function markNoShow(id: string): Promise<Appointment> {
  const { data } = await api.post<Appointment>(`/appointments/${id}/no-show`)
  return data
}
