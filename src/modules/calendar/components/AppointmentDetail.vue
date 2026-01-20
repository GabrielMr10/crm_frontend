<script setup lang="ts">
import { computed } from 'vue'
import type { Appointment, AppointmentStatus } from '@/types'
import { BaseButton } from '@/shared/components'
import {
  Calendar, Clock, MapPin, Video, User, FileText, Bell,
  CheckCircle, XCircle, UserX, Pencil, Trash2, Phone
} from 'lucide-vue-next'

const props = defineProps<{
  appointment: Appointment
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'delete'): void
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'complete'): void
  (e: 'no-show'): void
  (e: 'close'): void
}>()

const typeLabels: Record<string, string> = {
  meeting: 'Reunião',
  call: 'Ligação',
  visit: 'Visita',
  follow_up: 'Follow-up',
  demo: 'Demonstração',
  other: 'Outro'
}

const statusLabels: Record<AppointmentStatus, string> = {
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  no_show: 'Não compareceu'
}

const statusColors: Record<AppointmentStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-orange-100 text-orange-800'
}

const canConfirm = computed(() => props.appointment.status === 'scheduled')
const canCancel = computed(() => ['scheduled', 'confirmed'].includes(props.appointment.status))
const canComplete = computed(() => ['scheduled', 'confirmed'].includes(props.appointment.status))
const canMarkNoShow = computed(() => ['scheduled', 'confirmed'].includes(props.appointment.status))

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatDuration(): string {
  const start = new Date(props.appointment.start_time)
  const end = new Date(props.appointment.end_time)
  const diff = (end.getTime() - start.getTime()) / 1000 / 60
  if (diff < 60) return `${diff} minutos`
  const hours = Math.floor(diff / 60)
  const mins = diff % 60
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}min`
}

function getReminderLabel(): string {
  const mins = props.appointment.reminder_minutes
  if (!mins || mins === 0) return 'Sem lembrete'
  if (mins < 60) return `${mins} minutos antes`
  if (mins === 60) return '1 hora antes'
  if (mins === 1440) return '1 dia antes'
  return `${mins} minutos antes`
}

function formatPhone(value: string): string {
  if (!value) return ''
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 2) return numbers
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
  if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <div class="flex items-start justify-between mb-2">
        <h2 class="text-xl font-semibold text-gray-900">{{ appointment.title }}</h2>
        <span :class="['text-xs px-2 py-1 rounded-full font-medium', statusColors[appointment.status]]">
          {{ statusLabels[appointment.status] }}
        </span>
      </div>
      <span class="text-sm text-gray-500">{{ typeLabels[appointment.type] || appointment.type }}</span>
    </div>

    <!-- Details -->
    <div class="space-y-3">
      <div class="flex items-center gap-3 text-gray-600">
        <Calendar class="w-5 h-5 text-gray-400" />
        <span>{{ formatDateTime(appointment.start_time) }}</span>
      </div>

      <div class="flex items-center gap-3 text-gray-600">
        <Clock class="w-5 h-5 text-gray-400" />
        <span>{{ formatTime(appointment.start_time) }} - {{ formatTime(appointment.end_time) }} ({{ formatDuration() }})</span>
      </div>

      <div v-if="appointment.location" class="flex items-center gap-3 text-gray-600">
        <MapPin class="w-5 h-5 text-gray-400" />
        <span>{{ appointment.location }}</span>
      </div>

      <div v-if="appointment.meeting_url" class="flex items-center gap-3 text-gray-600">
        <Video class="w-5 h-5 text-gray-400" />
        <a :href="appointment.meeting_url" target="_blank" class="text-primary-600 hover:underline">
          Acessar reunião online
        </a>
      </div>

      <div v-if="appointment.reminder_minutes" class="flex items-center gap-3 text-gray-600">
        <Bell class="w-5 h-5 text-gray-400" />
        <span>{{ getReminderLabel() }}</span>
      </div>
    </div>

    <!-- Client Info -->
    <div v-if="appointment.client_name || appointment.lead" class="p-3 bg-gray-50 rounded-lg">
      <p class="text-xs text-gray-500 mb-1">Cliente</p>
      <p class="font-medium text-gray-900">{{ appointment.client_name || appointment.lead?.name }}</p>
      <div v-if="appointment.client_phone || appointment.lead?.phone" class="flex items-center gap-2 mt-1">
        <Phone class="w-4 h-4 text-gray-400" />
        <span class="text-sm text-gray-600">{{ formatPhone(appointment.client_phone || appointment.lead?.phone || '') }}</span>
      </div>
      <p v-if="appointment.lead?.email" class="text-sm text-gray-600 mt-1">{{ appointment.lead.email }}</p>
    </div>

    <!-- Assigned User -->
    <div v-if="appointment.assigned_user" class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
        <User class="w-4 h-4 text-primary-600" />
      </div>
      <div>
        <p class="text-xs text-gray-500">Responsável</p>
        <p class="text-sm font-medium text-gray-900">{{ appointment.assigned_user.full_name }}</p>
      </div>
    </div>

    <!-- Description -->
    <div v-if="appointment.description">
      <p class="text-xs text-gray-500 mb-1">Descrição</p>
      <p class="text-gray-700 whitespace-pre-wrap">{{ appointment.description }}</p>
    </div>

    <!-- Notes -->
    <div v-if="appointment.notes">
      <div class="flex items-center gap-2 mb-1">
        <FileText class="w-4 h-4 text-gray-400" />
        <p class="text-xs text-gray-500">Notas</p>
      </div>
      <p class="text-gray-700 whitespace-pre-wrap">{{ appointment.notes }}</p>
    </div>

    <!-- Status Actions -->
    <div v-if="canConfirm || canCancel || canComplete || canMarkNoShow" class="pt-4 border-t space-y-2">
      <p class="text-xs text-gray-500 mb-2">Alterar status</p>
      <div class="flex flex-wrap gap-2">
        <BaseButton v-if="canConfirm" size="sm" variant="outline" :loading="loading" @click="emit('confirm')">
          <CheckCircle class="w-4 h-4 mr-1" />
          Confirmar
        </BaseButton>
        <BaseButton v-if="canComplete" size="sm" variant="outline" :loading="loading" @click="emit('complete')">
          <CheckCircle class="w-4 h-4 mr-1" />
          Concluir
        </BaseButton>
        <BaseButton v-if="canMarkNoShow" size="sm" variant="outline" :loading="loading" @click="emit('no-show')">
          <UserX class="w-4 h-4 mr-1" />
          Não compareceu
        </BaseButton>
        <BaseButton v-if="canCancel" size="sm" variant="outline" :loading="loading" @click="emit('cancel')">
          <XCircle class="w-4 h-4 mr-1" />
          Cancelar
        </BaseButton>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-between pt-4 border-t">
      <BaseButton variant="danger" size="sm" @click="emit('delete')">
        <Trash2 class="w-4 h-4 mr-1" />
        Excluir
      </BaseButton>
      <div class="flex gap-2">
        <BaseButton variant="outline" @click="emit('close')">
          Fechar
        </BaseButton>
        <BaseButton @click="emit('edit')">
          <Pencil class="w-4 h-4 mr-1" />
          Editar
        </BaseButton>
      </div>
    </div>
  </div>
</template>
