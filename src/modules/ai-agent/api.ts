import api from '@/core/api'
import type { AgentConfig, AgentConfigUpdate, AgentStatus } from '@/types'

export async function getAgentConfig(): Promise<AgentConfig> {
  const { data } = await api.get<AgentConfig>('/ai-agent/config')
  return data
}

export async function updateAgentConfig(config: AgentConfigUpdate): Promise<AgentConfig> {
  const { data } = await api.patch<AgentConfig>('/ai-agent/config', config)
  return data
}

export async function toggleAgent(): Promise<{ is_enabled: boolean }> {
  const { data } = await api.post<{ is_enabled: boolean }>('/ai-agent/toggle')
  return data
}

export async function getAgentStatus(): Promise<AgentStatus> {
  const { data } = await api.get<AgentStatus>('/ai-agent/status')
  return data
}
