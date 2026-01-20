<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Appointment, AppointmentCreate, AppointmentUpdate, AppointmentType } from '@/types'
import { BaseButton, BaseInput } from '@/shared/components'
import { getLeads } from '@/modules/leads/api'
import { getUsers } from '@/modules/users/api'
import type { Lead, User } from '@/types'

const props = defineProps<{
  appointment?: Appointment | null
  loading?: boolean
  initialDate?: string
}>()

const emit = defineEmits<{
  (e: 'submit', data: AppointmentCreate | AppointmentUpdate): void
  (e: 'close'): void
}>()

const leads = ref<Lead[]>([])
const users = ref<User[]>([])
const loadingData = ref(true)
const errors = ref<Record<string, string>>({})

const form = ref({
  title: '',
  description: '',
  type: 'visit' as AppointmentType,
  lead_id: '',
  assigned_to: '',
  start_time: '',
  end_time: '',
  location: '',
  meeting_url: '',
  reminder_minutes: 30,
  notes: '',
  client_name: '',
  client_phone: ''
})

const typeOptions: { value: AppointmentType; label: string }[] = [
  { value: 'visit', label: 'Visita' },
  { value: 'meeting', label: 'Reunião' },
  { value: 'call', label: 'Ligação' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'demo', label: 'Demonstração' },
  { value: 'other', label: 'Outro' }
]

const reminderOptions = [
  { value: 0, label: 'Sem lembrete' },
  { value: 15, label: '15 minutos antes' },
  { value: 30, label: '30 minutos antes' },
  { value: 60, label: '1 hora antes' },
  { value: 1440, label: '1 dia antes' }
]

const isEditing = computed(() => !!props.appointment)

function formatDateTimeLocal(date: string): string {
  if (!date) return ''
  const d = new Date(date)
  const offset = d.getTimezoneOffset()
  const localDate = new Date(d.getTime() - offset * 60 * 1000)
  return localDate.toISOString().slice(0, 16)
}

function toISOString(localDateTime: string): string {
  if (!localDateTime) return ''
  return new Date(localDateTime).toISOString()
}

function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 2) return numbers
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
  if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
}

function handlePhoneInput(event: Event) {
  const input = event.target as HTMLInputElement
  const formatted = formatPhone(input.value)
  form.value.client_phone = formatted
}

async function loadData() {
  loadingData.value = true
  try {
    const [leadsData, usersData] = await Promise.all([
      getLeads({ per_page: 100 }),
      getUsers()
    ])
    leads.value = leadsData.items
    users.value = usersData.filter(u => u.is_active)
  } catch (err) {
    console.error('Erro ao carregar dados:', err)
  } finally {
    loadingData.value = false
  }
}

function initForm() {
  if (props.appointment) {
    form.value = {
      title: props.appointment.title,
      description: props.appointment.description || '',
      type: props.appointment.type,
      lead_id: props.appointment.lead_id || '',
      assigned_to: props.appointment.assigned_to || '',
      start_time: formatDateTimeLocal(props.appointment.start_time),
      end_time: formatDateTimeLocal(props.appointment.end_time),
      location: props.appointment.location || '',
      meeting_url: props.appointment.meeting_url || '',
      reminder_minutes: props.appointment.reminder_minutes ?? 30,
      notes: props.appointment.notes || '',
      client_name: props.appointment.client_name || '',
      client_phone: props.appointment.client_phone ? formatPhone(props.appointment.client_phone) : ''
    }
  } else if (props.initialDate) {
    const startDate = new Date(props.initialDate)
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)
    form.value.start_time = formatDateTimeLocal(startDate.toISOString())
    form.value.end_time = formatDateTimeLocal(endDate.toISOString())
  }
}

function validate(): boolean {
  errors.value = {}

  if (!form.value.title.trim()) {
    errors.value.title = 'Título é obrigatório'
  }

  if (!form.value.client_name.trim() && !form.value.lead_id) {
    errors.value.client_name = 'Nome do cliente é obrigatório'
  }

  if (!form.value.start_time) {
    errors.value.start_time = 'Data/hora de início é obrigatória'
  }

  if (!form.value.end_time) {
    errors.value.end_time = 'Data/hora de término é obrigatória'
  }

  if (form.value.start_time && form.value.end_time) {
    const start = new Date(form.value.start_time)
    const end = new Date(form.value.end_time)
    if (end <= start) {
      errors.value.end_time = 'Hora de término deve ser maior que início'
    }
  }

  return Object.keys(errors.value).length === 0
}

function handleSubmit() {
  if (!validate()) return

  const phoneNumbers = form.value.client_phone.replace(/\D/g, '')

  const data: AppointmentCreate | AppointmentUpdate = {
    title: form.value.title,
    description: form.value.description || undefined,
    type: form.value.type,
    lead_id: form.value.lead_id || undefined,
    assigned_to: form.value.assigned_to || undefined,
    start_time: toISOString(form.value.start_time),
    end_time: toISOString(form.value.end_time),
    location: form.value.location || undefined,
    meeting_url: form.value.meeting_url || undefined,
    reminder_minutes: form.value.reminder_minutes,
    notes: form.value.notes || undefined,
    client_name: form.value.client_name || undefined,
    client_phone: phoneNumbers || undefined
  }
  emit('submit', data)
}

// Clear client fields when lead is selected
watch(() => form.value.lead_id, (newVal) => {
  if (newVal) {
    const lead = leads.value.find(l => l.id === newVal)
    if (lead) {
      form.value.client_name = lead.name
      form.value.client_phone = lead.phone ? formatPhone(lead.phone) : ''
    }
  }
})

onMounted(() => {
  loadData()
  initForm()
})
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <BaseInput
      v-model="form.title"
      label="Título"
      placeholder="Ex: Visita Teste"
      required
      :error="errors.title"
    />

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
      <select
        v-model="form.type"
        class="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-primary-500 sm:text-sm"
      >
        <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <!-- Client Info Section -->
    <div class="bg-gray-50 p-4 rounded-lg space-y-4">
      <h3 class="text-sm font-medium text-gray-700">Informações do Cliente</h3>

      <BaseInput
        v-model="form.client_name"
        label="Nome do cliente"
        placeholder="Ex: João"
        :required="!form.lead_id"
        :error="errors.client_name"
      />

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
        <input
          :value="form.client_phone"
          @input="handlePhoneInput"
          type="tel"
          placeholder="(41) 99999-9999"
          class="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-primary-500 sm:text-sm"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Ou selecione um Lead existente</label>
        <select
          v-model="form.lead_id"
          class="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-primary-500 sm:text-sm"
          :disabled="loadingData"
        >
          <option value="">Nenhum lead selecionado</option>
          <option v-for="lead in leads" :key="lead.id" :value="lead.id">
            {{ lead.name }} {{ lead.email ? `(${lead.email})` : '' }}
          </option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Início <span class="text-red-500">*</span></label>
        <input
          v-model="form.start_time"
          type="datetime-local"
          required
          :class="[
            'block w-full rounded-lg border px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-primary-500 sm:text-sm',
            errors.start_time ? 'border-red-500' : 'border-gray-300'
          ]"
        />
        <p v-if="errors.start_time" class="mt-1 text-sm text-red-600">{{ errors.start_time }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Fim <span class="text-red-500">*</span></label>
        <input
          v-model="form.end_time"
          type="datetime-local"
          required
          :class="[
            'block w-full rounded-lg border px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-primary-500 sm:text-sm',
            errors.end_time ? 'border-red-500' : 'border-gray-300'
          ]"
        />
        <p v-if="errors.end_time" class="mt-1 text-sm text-red-600">{{ errors.end_time }}</p>
      </div>
    </div>

    <BaseInput
      v-model="form.location"
      label="Local"
      placeholder="Ex: Rua Teste, 123"
    />

    <BaseInput
      v-model="form.meeting_url"
      label="Link da reunião"
      placeholder="Ex: https://meet.google.com/..."
    />

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
      <select
        v-model="form.assigned_to"
        class="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-primary-500 sm:text-sm"
        :disabled="loadingData"
      >
        <option value="">Sem responsável</option>
        <option v-for="user in users" :key="user.id" :value="user.id">
          {{ user.full_name }}
        </option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Lembrete</label>
      <select
        v-model="form.reminder_minutes"
        class="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-primary-500 sm:text-sm"
      >
        <option v-for="opt in reminderOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Notas</label>
      <textarea
        v-model="form.notes"
        rows="2"
        class="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-primary-500 sm:text-sm"
        placeholder="Observações adicionais..."
      />
    </div>

    <div class="flex justify-end gap-3 pt-4">
      <BaseButton type="button" variant="outline" @click="emit('close')">
        Cancelar
      </BaseButton>
      <BaseButton type="submit" :loading="loading">
        {{ isEditing ? 'Salvar' : 'Agendar' }}
      </BaseButton>
    </div>
  </form>
</template>