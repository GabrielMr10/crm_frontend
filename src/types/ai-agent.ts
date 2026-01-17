export interface AgentConfig {
  id: string
  tenant_id: string
  is_enabled: boolean
  agent_name: string
  agent_role: string
  company_name: string | null
  company_description: string | null
  schedule_enabled: boolean
  schedule_start: string | null
  schedule_end: string | null
  schedule_days: number[]
  schedule_timezone: string
  outside_hours_message: string | null
  base_prompt: string | null
  max_messages_before_human: number
  response_delay_seconds: number
  llm_provider: string
  llm_model: string
  llm_temperature: number
  created_at: string
  updated_at: string
}

export interface AgentConfigUpdate {
  is_enabled?: boolean
  agent_name?: string
  agent_role?: string
  company_name?: string
  schedule_enabled?: boolean
  schedule_start?: string
  schedule_end?: string
  schedule_days?: number[]
  base_prompt?: string
}

export interface AgentStatus {
  is_enabled: boolean
  agent_name: string
  is_within_schedule: boolean
  schedule_enabled: boolean
}
