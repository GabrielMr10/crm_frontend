export const LeadStatus = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  PROPOSAL: 'proposal',
  NEGOTIATION: 'negotiation',
  WON: 'won',
  LOST: 'lost',
  INACTIVE: 'inactive'
} as const

export type LeadStatus = typeof LeadStatus[keyof typeof LeadStatus]

export const LeadSource = {
  MANUAL: 'manual',
  WHATSAPP: 'whatsapp',
  WEBSITE: 'website',
  FACEBOOK: 'facebook',
  GOOGLE: 'google',
  REFERRAL: 'referral',
  IMPORT: 'import',
  OTHER: 'other'
} as const

export type LeadSource = typeof LeadSource[keyof typeof LeadSource]

export interface Lead {
  id: string
  name: string
  email: string | null
  phone: string
  phone_secondary: string | null
  document: string | null
  company_name: string | null
  company_position: string | null
  address_street: string | null
  address_number: string | null
  address_complement: string | null
  address_neighborhood: string | null
  address_city: string | null
  address_state: string | null
  address_zipcode: string | null
  status: LeadStatus | string
  source: LeadSource | string
  source_detail: string | null
  score: number
  temperature: string | null
  interest: string | null
  budget: number | null
  notes: string | null
  tags: string[]
  custom_fields: Record<string, any>
  tenant_id: string
  assigned_to_id: string | null
  created_by_id: string | null
  created_at: string
  updated_at: string
  last_contact_at: string | null
  converted_at: string | null
}

export interface LeadCreate {
  name: string
  phone: string
  email?: string
  company_name?: string
  status?: LeadStatus | string
  source?: LeadSource | string
  interest?: string
  budget?: number
  notes?: string
  tags?: string[]
  assigned_to_id?: string
}

export interface LeadUpdate extends Partial<LeadCreate> {
  score?: number
  temperature?: string
}