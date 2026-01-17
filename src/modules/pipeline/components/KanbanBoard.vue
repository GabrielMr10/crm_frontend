<script setup lang="ts">
import type { KanbanView, Deal } from '@/types'
import KanbanColumn from './KanbanColumn.vue'

defineProps<{
  kanban: KanbanView
}>()

const emit = defineEmits<{
  (e: 'deal-click', deal: Deal): void
  (e: 'deal-moved', dealId: string, stageId: string): void
  (e: 'add-deal', stageId: string): void
}>()
</script>

<template>
  <div class="flex gap-4 overflow-x-auto pb-4">
    <KanbanColumn
      v-for="stage in kanban.stages"
      :key="stage.id"
      :stage="stage"
      @deal-click="emit('deal-click', $event)"
      @deal-moved="(dealId) => emit('deal-moved', dealId, stage.id)"
      @add-deal="emit('add-deal', $event)"
    />
  </div>
</template>
