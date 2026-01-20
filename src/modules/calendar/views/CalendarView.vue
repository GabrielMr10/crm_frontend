<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import ptBrLocale from '@fullcalendar/core/locales/pt-br'
import type { CalendarOptions, EventClickArg, DateSelectArg } from '@fullcalendar/core'
import { useUiStore } from '@/stores/ui'
import AppLayout from '@/layouts/AppLayout.vue'
import { BaseButton, BaseCard } from '@/shared/components'
import AppointmentForm from '../components/AppointmentForm.vue'
import AppointmentDetail from '../components/AppointmentDetail.vue'
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
  markNoShow
} from '../api'
import type { Appointment, AppointmentCreate, AppointmentUpdate, AppointmentStatus } from '@/types'
import { Plus, X, Loader2, CalendarDays } from 'lucide-vue-next'

const uiStore = useUiStore()

const loading = ref(true)
const appointments = ref<Appointment[]>([])
const showForm = ref(false)
const showDetail = ref(false)
const selectedAppointment = ref<Appointment | null>(null)
const selectedDate = ref<string | null>(null)
const formLoading = ref(false)
const statusLoading = ref(false)
const showDeleteConfirm = ref(false)
const deleteLoading = ref(false)

const statusColors: Record<AppointmentStatus, string> = {
  scheduled: '#3B82F6',
  confirmed: '#10B981',
  completed: '#6B7280',
  cancelled: '#EF4444',
  no_show: '#F97316'
}

const calendarEvents = computed(() => {
  return appointments.value.map(apt => ({
    id: apt.id,
    title: apt.title,
    start: apt.start_time,
    end: apt.end_time,
    backgroundColor: statusColors[apt.status],
    borderColor: statusColors[apt.status],
    extendedProps: { appointment: apt }
  }))
})

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  initialView: 'timeGridWeek',
  locale: ptBrLocale,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
  },
  buttonText: {
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    list: 'Lista'
  },
  events: calendarEvents.value,
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  nowIndicator: true,
  slotMinTime: '06:00:00',
  slotMaxTime: '22:00:00',
  slotDuration: '00:30:00',
  eventClick: handleEventClick,
  select: handleDateSelect,
  eventDrop: handleEventDrop,
  eventResize: handleEventResize,
  height: 'auto'
}))

async function loadAppointments() {
  loading.value = true
  try {
    appointments.value = await getAppointments()
  } catch (err: any) {
    console.error('Erro ao carregar compromissos:', err)
    uiStore.showError('Erro', err.response?.data?.detail || 'Falha ao carregar compromissos')
    appointments.value = []
  } finally {
    loading.value = false
  }
}

function handleEventClick(info: EventClickArg) {
  selectedAppointment.value = info.event.extendedProps.appointment
  showDetail.value = true
}

function handleDateSelect(info: DateSelectArg) {
  selectedDate.value = info.startStr
  selectedAppointment.value = null
  showForm.value = true
}

async function handleEventDrop(info: any) {
  const appointment = info.event.extendedProps.appointment as Appointment
  try {
    await updateAppointment(appointment.id, {
      start_time: info.event.start.toISOString(),
      end_time: info.event.end?.toISOString() || new Date(info.event.start.getTime() + 3600000).toISOString()
    })
    uiStore.showSuccess('Compromisso atualizado')
    await loadAppointments()
  } catch (err: any) {
    info.revert()
    uiStore.showError('Erro', err.response?.data?.detail || 'Falha ao mover compromisso')
  }
}

async function handleEventResize(info: any) {
  const appointment = info.event.extendedProps.appointment as Appointment
  try {
    await updateAppointment(appointment.id, {
      start_time: info.event.start.toISOString(),
      end_time: info.event.end.toISOString()
    })
    uiStore.showSuccess('Compromisso atualizado')
    await loadAppointments()
  } catch (err: any) {
    info.revert()
    uiStore.showError('Erro', err.response?.data?.detail || 'Falha ao redimensionar compromisso')
  }
}

function openCreateForm() {
  selectedAppointment.value = null
  selectedDate.value = null
  showForm.value = true
}

function openEditForm() {
  showDetail.value = false
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  selectedAppointment.value = null
  selectedDate.value = null
}

function closeDetail() {
  showDetail.value = false
  selectedAppointment.value = null
}

async function handleSubmit(data: AppointmentCreate | AppointmentUpdate) {
  formLoading.value = true
  try {
    if (selectedAppointment.value) {
      await updateAppointment(selectedAppointment.value.id, data as AppointmentUpdate)
      uiStore.showSuccess('Compromisso atualizado')
    } else {
      await createAppointment(data as AppointmentCreate)
      uiStore.showSuccess('Compromisso criado')
    }
    closeForm()
    await loadAppointments()
  } catch (err: any) {
    uiStore.showError('Erro', err.response?.data?.detail || 'Falha ao salvar compromisso')
  } finally {
    formLoading.value = false
  }
}

async function handleConfirm() {
  if (!selectedAppointment.value) return
  statusLoading.value = true
  try {
    await confirmAppointment(selectedAppointment.value.id)
    uiStore.showSuccess('Compromisso confirmado')
    closeDetail()
    await loadAppointments()
  } catch (err: any) {
    uiStore.showError('Erro', err.response?.data?.detail || 'Falha ao confirmar')
  } finally {
    statusLoading.value = false
  }
}

async function handleCancel() {
  if (!selectedAppointment.value) return
  statusLoading.value = true
  try {
    await cancelAppointment(selectedAppointment.value.id)
    uiStore.showSuccess('Compromisso cancelado')
    closeDetail()
    await loadAppointments()
  } catch (err: any) {
    uiStore.showError('Erro', err.response?.data?.detail || 'Falha ao cancelar')
  } finally {
    statusLoading.value = false
  }
}

async function handleComplete() {
  if (!selectedAppointment.value) return
  statusLoading.value = true
  try {
    await completeAppointment(selectedAppointment.value.id)
    uiStore.showSuccess('Compromisso concluído')
    closeDetail()
    await loadAppointments()
  } catch (err: any) {
    uiStore.showError('Erro', err.response?.data?.detail || 'Falha ao concluir')
  } finally {
    statusLoading.value = false
  }
}

async function handleNoShow() {
  if (!selectedAppointment.value) return
  statusLoading.value = true
  try {
    await markNoShow(selectedAppointment.value.id)
    uiStore.showSuccess('Marcado como não compareceu')
    closeDetail()
    await loadAppointments()
  } catch (err: any) {
    uiStore.showError('Erro', err.response?.data?.detail || 'Falha ao marcar')
  } finally {
    statusLoading.value = false
  }
}

function confirmDeleteAppointment() {
  showDeleteConfirm.value = true
}

function closeDeleteConfirm() {
  showDeleteConfirm.value = false
}

async function handleDelete() {
  if (!selectedAppointment.value) return
  deleteLoading.value = true
  try {
    await deleteAppointment(selectedAppointment.value.id)
    uiStore.showSuccess('Compromisso excluído')
    closeDeleteConfirm()
    closeDetail()
    await loadAppointments()
  } catch (err: any) {
    uiStore.showError('Erro', err.response?.data?.detail || 'Falha ao excluir')
  } finally {
    deleteLoading.value = false
  }
}

onMounted(loadAppointments)
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Agenda</h1>
          <p class="text-gray-500">{{ appointments.length }} compromissos</p>
        </div>
        <BaseButton @click="openCreateForm">
          <Plus class="w-4 h-4 mr-2" />
          Novo Compromisso
        </BaseButton>
      </div>

      <!-- Legend -->
      <div class="flex flex-wrap gap-4 text-sm">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-blue-500"></div>
          <span class="text-gray-600">Agendado</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-green-500"></div>
          <span class="text-gray-600">Confirmado</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-gray-500"></div>
          <span class="text-gray-600">Concluído</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-red-500"></div>
          <span class="text-gray-600">Cancelado</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-orange-500"></div>
          <span class="text-gray-600">Não compareceu</span>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <Loader2 class="w-8 h-8 text-primary-600 animate-spin" />
      </div>

      <!-- Calendar -->
      <BaseCard v-else class="p-4">
        <FullCalendar :options="calendarOptions" />
      </BaseCard>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/50" @click="closeForm" />
      <div class="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 class="text-xl font-semibold">
            {{ selectedAppointment ? 'Editar Compromisso' : 'Novo Compromisso' }}
          </h2>
          <button @click="closeForm" class="p-2 hover:bg-gray-100 rounded-lg">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6">
          <AppointmentForm
            :appointment="selectedAppointment"
            :loading="formLoading"
            :initial-date="selectedDate || undefined"
            @submit="handleSubmit"
            @close="closeForm"
          />
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetail && selectedAppointment" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/50" @click="closeDetail" />
      <div class="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <CalendarDays class="w-5 h-5 text-primary-600" />
            <h2 class="text-xl font-semibold">Detalhes</h2>
          </div>
          <button @click="closeDetail" class="p-2 hover:bg-gray-100 rounded-lg">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6">
          <AppointmentDetail
            :appointment="selectedAppointment"
            :loading="statusLoading"
            @edit="openEditForm"
            @delete="confirmDeleteAppointment"
            @confirm="handleConfirm"
            @cancel="handleCancel"
            @complete="handleComplete"
            @no-show="handleNoShow"
            @close="closeDetail"
          />
        </div>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/50" @click="closeDeleteConfirm" />
      <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 class="text-xl font-semibold mb-2">Excluir Compromisso</h2>
        <p class="text-gray-600 mb-6">
          Tem certeza que deseja excluir <strong>{{ selectedAppointment?.title }}</strong>?
          Esta ação não pode ser desfeita.
        </p>
        <div class="flex justify-end gap-3">
          <BaseButton variant="outline" @click="closeDeleteConfirm">Cancelar</BaseButton>
          <BaseButton variant="danger" :loading="deleteLoading" @click="handleDelete">Excluir</BaseButton>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style>
.fc {
  --fc-border-color: #e5e7eb;
  --fc-button-bg-color: #6366f1;
  --fc-button-border-color: #6366f1;
  --fc-button-hover-bg-color: #4f46e5;
  --fc-button-hover-border-color: #4f46e5;
  --fc-button-active-bg-color: #4338ca;
  --fc-button-active-border-color: #4338ca;
  --fc-today-bg-color: #eef2ff;
  --fc-event-border-color: transparent;
}

.fc .fc-button {
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}

.fc .fc-button-group > .fc-button {
  border-radius: 0;
}

.fc .fc-button-group > .fc-button:first-child {
  border-top-left-radius: 0.5rem;
  border-bottom-left-radius: 0.5rem;
}

.fc .fc-button-group > .fc-button:last-child {
  border-top-right-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}

.fc .fc-toolbar-title {
  font-size: 1.25rem;
  font-weight: 600;
}

.fc .fc-daygrid-day-number {
  padding: 0.5rem;
  font-weight: 500;
}

.fc .fc-event {
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 0.75rem;
}

.fc .fc-event:hover {
  opacity: 0.9;
}

.fc .fc-timegrid-slot {
  height: 2.5rem;
}

.fc .fc-col-header-cell-cushion {
  font-weight: 600;
  text-transform: capitalize;
}
</style>
