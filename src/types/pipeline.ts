export interface Pipeline {
  id: string
  name: string
  description: string | null
  is_active: boolean
  is_default: boolean
  settings: Record<string, any>
  tenant_id: string
  created_at: string
  updated_at: string
}

export interface Stage {
  id: string
  name: string
  position: number
  color: string
  is_won: boolean
  is_lost: boolean
  auto_probability: number | null
  pipeline_id: string
  created_at: string
}

export interface Deal {
  id: string
  title: string
  value: number
  probability: number
  expected_close_date: string | null
  notes: string | null
  position: number
  is_won: boolean
  is_lost: boolean
  lost_reason: string | null
  custom_fields: Record<string, any>
  tenant_id: string
  pipeline_id: string
  stage_id: string
  lead_id: string | null
  assigned_to_id: string | null
  created_by_id: string | null
  created_at: string
  updated_at: string
  won_at: string | null
  lost_at: string | null
}

export interface DealCreate {
  title: string
  stage_id: string
  value?: number
  probability?: number
  expected_close_date?: string
  notes?: string
  lead_id?: string
  assigned_to_id?: string
}

export interface DealMove {
  stage_id: string
  position?: number
}

export interface KanbanStage extends Stage {
  deals: Deal[]
  deals_count: number
  deals_value: number
}

export interface KanbanView {
  pipeline: Pipeline
  stages: KanbanStage[]
  total_deals: number
  total_value: number
}
