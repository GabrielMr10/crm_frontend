<script setup lang="ts">
import { computed } from 'vue'
import draggable from 'vuedraggable'
import type { KanbanStage, Deal } from '@/types'
import DealCard from './DealCard.vue'
import { formatCurrency } from '@/shared/utils/formatters'
import { Plus } from 'lucide-vue-next'

const props = defineProps<{
  stage: KanbanStage
}>()

const emit = defineEmits<{
  (e: 'deal-click', deal: Deal): void
  (e: 'deal-moved', dealId: string, stageId: string): void
  (e: 'add-deal', stageId: string): void
}>()

const deals = computed({
  get: () => props.stage.deals,
  set: () => {}
})

function onDragChange(event: any) {
  if (event.added) {
    emit('deal-moved', event.added.element.id, props.stage.id)
  }
}
</script>

<template>
  <div class="flex flex-col bg-gray-100 rounded-lg min-w-[300px] max-w-[300px]">
    <!-- Header -->
    <div class="p-3 border-b border-gray-200">
      <div class="flex items-center gap-2 mb-1">
        <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: stage.color || '#6b7280' }" />
        <h3 class="font-semibold text-gray-900">{{ stage.name }}</h3>
        <span class="ml-auto text-sm text-gray-500">{{ stage.deals_count }}</span>
      </div>
      <p class="text-sm text-gray-500">{{ formatCurrency(stage.deals_value) }}</p>
    </div>

    <!-- Deals -->
    <draggable
      :list="deals"
      group="deals"
      item-key="id"
      class="flex-1 p-2 space-y-2 min-h-[200px] overflow-y-auto"
      ghost-class="opacity-50"
      @change="onDragChange"
    >
      <template #item="{ element: deal }">
        <DealCard :deal="deal" @click="emit('deal-click', deal)" />
      </template>
    </draggable>

    <!-- Add Deal Button -->
    <button @click="emit('add-deal', stage.id)"
      class="m-2 p-2 flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
      <Plus class="w-4 h-4" />
      Adicionar
    </button>
  </div>
</template>
