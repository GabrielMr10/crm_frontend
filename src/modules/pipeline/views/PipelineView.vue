<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUiStore } from '@/stores/ui'
import AppLayout from '@/layouts/AppLayout.vue'
import { BaseButton, BaseCard } from '@/shared/components'
import KanbanBoard from '../components/KanbanBoard.vue'
import DealForm from '../components/DealForm.vue'
import { getPipelines, getKanban, createDeal, moveDeal, createPipeline } from '../api'
import type { Pipeline, KanbanView, Deal, DealCreate, Stage } from '@/types'
import { formatCurrency } from '@/shared/utils/formatters'
import { Plus, Kanban, Loader2, X, ChevronDown } from 'lucide-vue-next'

const uiStore = useUiStore()

const loading = ref(true)
const pipelines = ref<Pipeline[]>([])
const selectedPipelineId = ref<string | null>(null)
const kanban = ref<KanbanView | null>(null)
const showPipelineSelector = ref(false)

// Deal Form
const showDealForm = ref(false)
const selectedDeal = ref<Deal | null>(null)
const initialStageId = ref<string>('')
const formLoading = ref(false)

// Create Pipeline
const showCreatePipeline = ref(false)
const newPipelineName = ref('')
const createPipelineLoading = ref(false)

const selectedPipeline = computed(() =>
  pipelines.value.find(p => p.id === selectedPipelineId.value)
)

const stages = computed<Stage[]>(() =>
  kanban.value?.stages.map(s => ({
    id: s.id,
    name: s.name,
    position: s.position,
    color: s.color,
    is_won: s.is_won,
    is_lost: s.is_lost,
    auto_probability: s.auto_probability,
    pipeline_id: s.pipeline_id,
    created_at: s.created_at
  })) || []
)

async function loadPipelines() {
  try {
    pipelines.value = await getPipelines()
    if (pipelines.value.length > 0 && !selectedPipelineId.value) {
      const defaultPipeline = pipelines.value.find(p => p.is_default) ?? pipelines.value[0]
      if (defaultPipeline) {
        selectedPipelineId.value = defaultPipeline.id
      }
    }
  } catch {
    uiStore.showError('Erro', 'Falha ao carregar pipelines')
  }
}

async function loadKanban() {
  if (!selectedPipelineId.value) return
  loading.value = true
  try {
    kanban.value = await getKanban(selectedPipelineId.value)
  } catch {
    uiStore.showError('Erro', 'Falha ao carregar kanban')
  } finally {
    loading.value = false
  }
}

async function selectPipeline(id: string) {
  selectedPipelineId.value = id
  showPipelineSelector.value = false
  await loadKanban()
}

async function handleDealMoved(dealId: string, stageId: string) {
  try {
    await moveDeal(dealId, { stage_id: stageId })
    await loadKanban()
  } catch {
    uiStore.showError('Erro', 'Falha ao mover negocio')
    await loadKanban()
  }
}

function openDealForm(stageId?: string) {
  selectedDeal.value = null
  initialStageId.value = stageId || stages.value[0]?.id || ''
  showDealForm.value = true
}

function openDealDetail(deal: Deal) {
  selectedDeal.value = deal
  initialStageId.value = deal.stage_id
  showDealForm.value = true
}

async function handleDealSubmit(data: DealCreate) {
  if (!selectedPipelineId.value) return
  formLoading.value = true
  try {
    await createDeal(selectedPipelineId.value, data)
    uiStore.showSuccess('Sucesso', 'Negocio criado')
    showDealForm.value = false
    await loadKanban()
  } catch (err: any) {
    uiStore.showError('Erro', err.response?.data?.detail || 'Falha ao criar negocio')
  } finally {
    formLoading.value = false
  }
}

async function handleCreatePipeline() {
  if (!newPipelineName.value) return
  createPipelineLoading.value = true
  try {
    const pipeline = await createPipeline({ name: newPipelineName.value })
    pipelines.value.push(pipeline)
    selectedPipelineId.value = pipeline.id
    showCreatePipeline.value = false
    newPipelineName.value = ''
    await loadKanban()
    uiStore.showSuccess('Sucesso', 'Pipeline criado')
  } catch (err: any) {
    uiStore.showError('Erro', err.response?.data?.detail || 'Falha ao criar pipeline')
  } finally {
    createPipelineLoading.value = false
  }
}

onMounted(async () => {
  await loadPipelines()
  if (selectedPipelineId.value) {
    await loadKanban()
  } else {
    loading.value = false
  }
})
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Pipeline de Vendas</h1>
          <div v-if="kanban" class="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span>{{ kanban.total_deals }} negocios</span>
            <span>•</span>
            <span>{{ formatCurrency(kanban.total_value) }} total</span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Pipeline Selector -->
          <div class="relative">
            <button @click="showPipelineSelector = !showPipelineSelector"
              class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <span>{{ selectedPipeline?.name || 'Selecionar Pipeline' }}</span>
              <ChevronDown class="w-4 h-4" />
            </button>

            <div v-if="showPipelineSelector"
              class="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-20">
              <div class="p-2">
                <button v-for="pipeline in pipelines" :key="pipeline.id"
                  @click="selectPipeline(pipeline.id)"
                  :class="['w-full text-left px-3 py-2 rounded-lg', pipeline.id === selectedPipelineId ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-100']">
                  {{ pipeline.name }}
                </button>
              </div>
              <div class="border-t p-2">
                <button @click="showCreatePipeline = true; showPipelineSelector = false"
                  class="w-full flex items-center gap-2 px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg">
                  <Plus class="w-4 h-4" />
                  Novo Pipeline
                </button>
              </div>
            </div>
          </div>

          <BaseButton @click="openDealForm()" :disabled="!selectedPipelineId">
            <Plus class="w-4 h-4 mr-2" />
            Novo Negocio
          </BaseButton>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <Loader2 class="w-8 h-8 text-primary-600 animate-spin" />
      </div>

      <!-- Empty State -->
      <BaseCard v-else-if="!kanban || kanban.stages.length === 0">
        <div class="text-center py-12">
          <Kanban class="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhum pipeline configurado</h3>
          <p class="text-gray-500 mb-4">Crie seu primeiro pipeline para comecar</p>
          <BaseButton @click="showCreatePipeline = true">
            <Plus class="w-4 h-4 mr-2" />
            Criar Pipeline
          </BaseButton>
        </div>
      </BaseCard>

      <!-- Kanban Board -->
      <KanbanBoard v-else
        :kanban="kanban"
        @deal-click="openDealDetail"
        @deal-moved="handleDealMoved"
        @add-deal="openDealForm"
      />
    </div>

    <!-- Deal Form Modal -->
    <Teleport to="body">
      <div v-if="showDealForm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50" @click="showDealForm = false" />
        <div class="relative bg-white rounded-xl shadow-xl max-w-lg w-full">
          <div class="border-b px-6 py-4 flex items-center justify-between">
            <h2 class="text-xl font-semibold">{{ selectedDeal ? 'Editar Negocio' : 'Novo Negocio' }}</h2>
            <button @click="showDealForm = false" class="p-2 hover:bg-gray-100 rounded-lg">
              <X class="w-5 h-5" />
            </button>
          </div>
          <div class="p-6">
            <DealForm
              :deal="selectedDeal"
              :stages="stages"
              :initial-stage-id="initialStageId"
              :loading="formLoading"
              @submit="handleDealSubmit"
              @close="showDealForm = false"
            />
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Create Pipeline Modal -->
    <Teleport to="body">
      <div v-if="showCreatePipeline" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50" @click="showCreatePipeline = false" />
        <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <h2 class="text-xl font-semibold mb-4">Criar Pipeline</h2>
          <form @submit.prevent="handleCreatePipeline">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome do Pipeline</label>
              <input v-model="newPipelineName" type="text" placeholder="Ex: Vendas, Projetos..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
            </div>
            <div class="flex justify-end gap-3">
              <BaseButton type="button" variant="outline" @click="showCreatePipeline = false">Cancelar</BaseButton>
              <BaseButton type="submit" :loading="createPipelineLoading" :disabled="!newPipelineName">Criar</BaseButton>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Close Pipeline Selector on outside click -->
    <div v-if="showPipelineSelector" class="fixed inset-0 z-10" @click="showPipelineSelector = false" />
  </AppLayout>
</template>
