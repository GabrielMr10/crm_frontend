export interface Tenant {
  id: string
  name: string
  slug: string
  email: string
  phone: string | null
  document: string | null
  plan: string
  is_active: boolean
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface TenantUpdate {
  name?: string
  email?: string
  phone?: string
  document?: string
}
