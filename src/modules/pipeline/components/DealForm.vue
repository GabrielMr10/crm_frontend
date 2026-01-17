<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Deal, DealCreate, Stage } from '@/types'
import { BaseButton } from '@/shared/components'

const props = defineProps<{
  deal?: Deal | null
  stages: Stage[]
  initialStageId?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', data: DealCreate): void
  (e: 'close'): void
}>()

const isEditing = computed(() => !!props.deal)

const form = ref<DealCreate>({
  title: '',
  stage_id: props.initialStageId || props.stages[0]?.id || '',
  value: 0,
  probability: 50,
  expected_close_date: '',
  notes: ''
})

watch(() => props.deal, (deal) => {
  if (deal) {
    form.value = {
      title: deal.title,
      stage_id: deal.stage_id,
      value: deal.value,
      probability: deal.probability,
      expected_close_date: deal.expected_close_date || '',
      notes: deal.notes || ''
    }
  }
}, { immediate: true })

watch(() => props.initialStageId, (stageId) => {
  if (stageId && !props.deal) {
    form.value.stage_id = stageId
  }
})

const errors = ref<Record<string, string>>({})

function validate(): boolean {
  errors.value = {}
  if (!form.value.title || form.value.title.length < 2) errors.value.title = 'Titulo obrigatorio'
  if (!form.value.stage_id) errors.value.stage_id = 'Selecione uma etapa'
  return Object.keys(errors.value).length === 0
}

function submit() {
  if (!validate()) return
  emit('submit', {
    ...form.value,
    expected_close_date: form.value.expected_close_date || undefined,
    notes: form.value.notes || undefined
  })
}
</script>

<template>
  <form @submit.prevent="submit" class="space-y-4">
    <!-- Titulo -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Titulo *</label>
      <input v-model="form.title" type="text" placeholder="Nome do negocio"
        :class="['w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500', errors.title ? 'border-red-300' : 'border-gray-300']" />
      <p v-if="errors.title" class="mt-1 text-sm text-red-600">{{ errors.title }}</p>
    </div>

    <!-- Etapa -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Etapa *</label>
      <select v-model="form.stage_id"
        :class="['w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500', errors.stage_id ? 'border-red-300' : 'border-gray-300']">
        <option v-for="stage in stages" :key="stage.id" :value="stage.id">{{ stage.name }}</option>
      </select>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <!-- Valor -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
        <input v-model.number="form.value" type="number" min="0" step="0.01" placeholder="0.00"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
      </div>

      <!-- Probabilidade -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Probabilidade (%)</label>
        <input v-model.number="form.probability" type="number" min="0" max="100" step="5"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
      </div>
    </div>

    <!-- Data de fechamento -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Previsao de fechamento</label>
      <input v-model="form.expected_close_date" type="date"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
    </div>

    <!-- Notas -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Notas</label>
      <textarea v-model="form.notes" rows="3" placeholder="Observacoes..."
        class="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500"></textarea>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-3 pt-4 border-t">
      <BaseButton type="button" variant="outline" @click="emit('close')">Cancelar</BaseButton>
      <BaseButton type="submit" :loading="loading">
        {{ isEditing ? 'Salvar' : 'Criar Negocio' }}
      </BaseButton>
    </div>
  </form>
</template>
