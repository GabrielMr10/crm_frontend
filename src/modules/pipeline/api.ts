import api from '@/core/api'
import type { Pipeline, Stage, Deal, DealCreate, DealMove, KanbanView } from '@/types'

// Pipelines
export async function getPipelines(): Promise<Pipeline[]> {
  const { data } = await api.get<Pipeline[]>('/pipelines')
  return data
}

export async function getPipeline(id: string): Promise<Pipeline & { stages: Stage[] }> {
  const { data } = await api.get<Pipeline & { stages: Stage[] }>(`/pipelines/${id}`)
  return data
}

export async function getKanban(pipelineId: string): Promise<KanbanView> {
  const { data } = await api.get<KanbanView>(`/pipelines/${pipelineId}/kanban`)
  return data
}

export async function createPipeline(pipeline: { name: string; description?: string }): Promise<Pipeline> {
  const { data } = await api.post<Pipeline>('/pipelines', pipeline)
  return data
}

// Stages
export async function createStage(pipelineId: string, stage: { name: string; color?: string }): Promise<Stage> {
  const { data } = await api.post<Stage>(`/pipelines/${pipelineId}/stages`, stage)
  return data
}

export async function reorderStages(pipelineId: string, stageIds: string[]): Promise<Stage[]> {
  const { data } = await api.put<Stage[]>(`/pipelines/${pipelineId}/stages/reorder`, { stage_ids: stageIds })
  return data
}

export async function updateStage(stageId: string, stage: { name?: string; color?: string }): Promise<Stage> {
  const { data } = await api.patch<Stage>(`/stages/${stageId}`, stage)
  return data
}

export async function deleteStage(stageId: string): Promise<void> {
  await api.delete(`/stages/${stageId}`)
}

// Deals
export async function createDeal(pipelineId: string, deal: DealCreate): Promise<Deal> {
  const { data } = await api.post<Deal>(`/pipelines/${pipelineId}/deals`, deal)
  return data
}

export async function getDeal(dealId: string): Promise<Deal> {
  const { data } = await api.get<Deal>(`/deals/${dealId}`)
  return data
}

export async function updateDeal(dealId: string, deal: Partial<DealCreate>): Promise<Deal> {
  const { data } = await api.patch<Deal>(`/deals/${dealId}`, deal)
  return data
}

export async function moveDeal(dealId: string, move: DealMove): Promise<Deal> {
  const { data } = await api.put<Deal>(`/deals/${dealId}/move`, move)
  return data
}

export async function markDealWon(dealId: string): Promise<Deal> {
  const { data } = await api.post<Deal>(`/deals/${dealId}/won`)
  return data
}

export async function markDealLost(dealId: string, reason?: string): Promise<Deal> {
  const { data } = await api.post<Deal>(`/deals/${dealId}/lost`, { reason })
  return data
}

export async function deleteDeal(dealId: string): Promise<void> {
  await api.delete(`/deals/${dealId}`)
}
