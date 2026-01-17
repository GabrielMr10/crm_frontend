<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Lead, LeadCreate, LeadUpdate } from '@/types'
import { LeadStatus, LeadSource } from '@/types'
import { LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS } from '@/shared/utils/constants'
import { BaseButton } from '@/shared/components'
import { vMaska } from 'maska/vue'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  lead?: Lead | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', data: LeadCreate | LeadUpdate): void
  (e: 'close'): void
}>()

const isEditing = computed(() => !!props.lead)

const form = ref<LeadCreate>({
  name: '',
  phone: '',
  email: '',
  company_name: '',
  status: LeadStatus.NEW,
  source: LeadSource.MANUAL,
  interest: '',
  budget: undefined,
  notes: '',
  tags: []
})

watch(() => props.lead, (lead) => {
  if (lead) {
    form.value = {
      name: lead.name,
      phone: lead.phone,
      email: lead.email || '',
      company_name: lead.company_name || '',
      status: lead.status as LeadStatus,
      source: lead.source as LeadSource,
      interest: lead.interest || '',
      budget: lead.budget || undefined,
      notes: lead.notes || '',
      tags: lead.tags || []
    }
  }
}, { immediate: true })

const errors = ref<Record<string, string>>({})

function validate(): boolean {
  errors.value = {}
  if (!form.value.name || form.value.name.length < 2) errors.value.name = 'Nome obrigatorio (min. 2 caracteres)'
  if (!form.value.phone || form.value.phone.replace(/\D/g, '').length < 10) errors.value.phone = 'Telefone invalido'
  if (form.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) errors.value.email = 'Email invalido'
  return Object.keys(errors.value).length === 0
}

function submit() {
  if (!validate()) return
  const data = {
    ...form.value,
    phone: form.value.phone.replace(/\D/g, ''),
    email: form.value.email || undefined,
    company_name: form.value.company_name || undefined,
    interest: form.value.interest || undefined,
    budget: form.value.budget || undefined,
    notes: form.value.notes || undefined
  }
  emit('submit', data)
}

const tagInput = ref('')
function addTag() {
  if (tagInput.value && !form.value.tags?.includes(tagInput.value)) {
    form.value.tags = [...(form.value.tags || []), tagInput.value]
    tagInput.value = ''
  }
}
function removeTag(tag: string) {
  form.value.tags = form.value.tags?.filter(t => t !== tag) || []
}
</script>

<template>
  <form @submit.prevent="submit" class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Nome -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
        <input v-model="form.name" type="text" placeholder="Nome do lead"
          :class="['w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500', errors.name ? 'border-red-300' : 'border-gray-300']" />
        <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
      </div>

      <!-- Telefone -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
        <input v-model="form.phone" v-maska="'(##) #####-####'" placeholder="(41) 99999-9999"
          :class="['w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500', errors.phone ? 'border-red-300' : 'border-gray-300']" />
        <p v-if="errors.phone" class="mt-1 text-sm text-red-600">{{ errors.phone }}</p>
      </div>

      <!-- Email -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input v-model="form.email" type="email" placeholder="email@exemplo.com"
          :class="['w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500', errors.email ? 'border-red-300' : 'border-gray-300']" />
        <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
      </div>

      <!-- Empresa -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
        <input v-model="form.company_name" type="text" placeholder="Nome da empresa"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
      </div>

      <!-- Status -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select v-model="form.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
          <option v-for="(label, key) in LEAD_STATUS_LABELS" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>

      <!-- Origem -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Origem</label>
        <select v-model="form.source" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
          <option v-for="(label, key) in LEAD_SOURCE_LABELS" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>

      <!-- Interesse -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Interesse</label>
        <input v-model="form.interest" type="text" placeholder="Produto/servico de interesse"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
      </div>

      <!-- Budget -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Orcamento (R$)</label>
        <input v-model.number="form.budget" type="number" placeholder="0.00" min="0" step="0.01"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
      </div>
    </div>

    <!-- Tags -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Tags</label>
      <div class="flex flex-wrap gap-2 mb-2">
        <span v-for="tag in form.tags" :key="tag"
          class="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded text-sm">
          {{ tag }}
          <button type="button" @click="removeTag(tag)"><X class="w-3 h-3" /></button>
        </span>
      </div>
      <div class="flex gap-2">
        <input v-model="tagInput" type="text" placeholder="Adicionar tag" @keydown.enter.prevent="addTag"
          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
        <BaseButton type="button" variant="outline" @click="addTag">Adicionar</BaseButton>
      </div>
    </div>

    <!-- Notas -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Notas</label>
      <textarea v-model="form.notes" rows="3" placeholder="Observacoes sobre o lead..."
        class="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500"></textarea>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-3 pt-4 border-t">
      <BaseButton type="button" variant="outline" @click="emit('close')">Cancelar</BaseButton>
      <BaseButton type="submit" :loading="loading">
        {{ isEditing ? 'Salvar' : 'Criar Lead' }}
      </BaseButton>
    </div>
  </form>
</template>
