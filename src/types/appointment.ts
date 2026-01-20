export type AppointmentType = 'meeting' | 'call' | 'visit' | 'follow_up' | 'demo' | 'other'
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

export interface Appointment {
  id: string
  tenant_id: string
  lead_id?: string
  assigned_to?: string
  title: string
  description?: string
  type: AppointmentType
  status: AppointmentStatus
  start_time: string
  end_time: string
  location?: string
  meeting_url?: string
  reminder_minutes?: number
  notes?: string
  client_name?: string
  client_phone?: string
  created_at: string
  updated_at: string
  lead?: {
    id: string
    name: string
    email?: string
    phone?: string
  }
  assigned_user?: {
    id: string
    full_name: string
    email: string
  }
}

export interface AppointmentCreate {
  lead_id?: string
  assigned_to?: string
  title: string
  description?: string
  type: AppointmentType
  start_time: string
  end_time: string
  location?: string
  meeting_url?: string
  reminder_minutes?: number
  notes?: string
  client_name?: string
  client_phone?: string
}

export interface AppointmentUpdate {
  lead_id?: string
  assigned_to?: string
  title?: string
  description?: string
  type?: AppointmentType
  status?: AppointmentStatus
  start_time?: string
  end_time?: string
  location?: string
  meeting_url?: string
  reminder_minutes?: number
  notes?: string
  client_name?: string
  client_phone?: string
}