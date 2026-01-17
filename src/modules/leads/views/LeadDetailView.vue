<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import AppLayout from '@/layouts/AppLayout.vue'
import { BaseButton, BaseCard } from '@/shared/components'
import LeadStatusBadge from '../components/LeadStatusBadge.vue'
import LeadForm from '../components/LeadForm.vue'
import { getLead, updateLead, deleteLead } from '../api'
import type { Lead, LeadUpdate } from '@/types'
import { formatPhone, formatDate, formatCurrency, formatRelativeTime } from '@/shared/utils/formatters'
import { LEAD_SOURCE_LABELS } from '@/shared/utils/constants'
import { ArrowLeft, Phone, Mail, Building2, MapPin, Edit, Trash2, Loader2, X } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()

const loading = ref(true)
const lead = ref<Lead | null>(null)
const showEditForm = ref(false)
const formLoading = ref(false)
const showDeleteConfirm = ref(false)
const deleteLoading = ref(false)

const leadId = computed(() => route.params.id as string)

async function loadLead() {
  loading.value = true
  try {
    lead.value = await getLead(leadId.value)
  } catch {
    uiStore.showError('Erro', 'Lead nao encontrado')
    router.push('/leads')
  } finally {
    loading.value = false
  }
}

async function handleUpdate(data: LeadUpdate) {
  formLoading.value = true
  try {
    lead.value = await updateLead(leadId.value, data)
    uiStore.showSuccess('Sucesso', 'Lead atualizado')
    showEditForm.value = false
  } catch (err: any) {
    uiStore.showError('Erro', err.response?.data?.detail || 'Falha ao atualizar')
  } finally {
    formLoading.value = false
  }
}

async function handleDelete() {
  deleteLoading.value = true
  try {
    await deleteLead(leadId.value)
    uiStore.showSuccess('Sucesso', 'Lead excluido')
    router.push('/leads')
  } catch {
    uiStore.showError('Erro', 'Falha ao excluir lead')
  } finally {
    deleteLoading.value = false
  }
}

onMounted(() => loadLead())
</script>

<template>
  <AppLayout>
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <Loader2 class="w-8 h-8 text-primary-600 animate-spin" />
    </div>

    <div v-else-if="lead" class="space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <button @click="router.push('/leads')" class="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div class="flex-1">
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900">{{ lead.name }}</h1>
            <LeadStatusBadge :status="lead.status" />
          </div>
          <p v-if="lead.company_name" class="text-gray-500">{{ lead.company_name }}</p>
        </div>
        <div class="flex gap-2">
          <BaseButton variant="outline" @click="showEditForm = true">
            <Edit class="w-4 h-4 mr-2" />
            Editar
          </BaseButton>
          <BaseButton variant="danger" @click="showDeleteConfirm = true">
            <Trash2 class="w-4 h-4 mr-2" />
            Excluir
          </BaseButton>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Info -->
        <div class="lg:col-span-2 space-y-6">
          <BaseCard title="Informacoes de Contato">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Phone class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p class="text-sm text-gray-500">Telefone</p>
                  <p class="font-medium">{{ formatPhone(lead.phone) }}</p>
                </div>
              </div>

              <div v-if="lead.email" class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Mail class="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p class="text-sm text-gray-500">Email</p>
                  <p class="font-medium">{{ lead.email }}</p>
                </div>
              </div>

              <div v-if="lead.company_name" class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Building2 class="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p class="text-sm text-gray-500">Empresa</p>
                  <p class="font-medium">{{ lead.company_name }}</p>
                </div>
              </div>

              <div v-if="lead.address_city" class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <MapPin class="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p class="text-sm text-gray-500">Localizacao</p>
                  <p class="font-medium">{{ lead.address_city }}, {{ lead.address_state }}</p>
                </div>
              </div>
            </div>
          </BaseCard>

          <BaseCard v-if="lead.notes" title="Notas">
            <p class="text-gray-700 whitespace-pre-wrap">{{ lead.notes }}</p>
          </BaseCard>

          <BaseCard v-if="lead.tags?.length" title="Tags">
            <div class="flex flex-wrap gap-2">
              <span v-for="tag in lead.tags" :key="tag"
                class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {{ tag }}
              </span>
            </div>
          </BaseCard>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <BaseCard title="Detalhes">
            <div class="space-y-4">
              <div>
                <p class="text-sm text-gray-500">Origem</p>
                <p class="font-medium">{{ LEAD_SOURCE_LABELS[lead.source as keyof typeof LEAD_SOURCE_LABELS] || lead.source }}</p>
              </div>

              <div v-if="lead.interest">
                <p class="text-sm text-gray-500">Interesse</p>
                <p class="font-medium">{{ lead.interest }}</p>
              </div>

              <div v-if="lead.budget">
                <p class="text-sm text-gray-500">Orcamento</p>
                <p class="font-medium">{{ formatCurrency(lead.budget) }}</p>
              </div>

              <div>
                <p class="text-sm text-gray-500">Score</p>
                <p :class="['font-medium', lead.score >= 70 ? 'text-green-600' : lead.score >= 40 ? 'text-yellow-600' : 'text-gray-600']">
                  {{ lead.score }} pontos
                </p>
              </div>

              <hr />

              <div>
                <p class="text-sm text-gray-500">Criado em</p>
                <p class="font-medium">{{ formatDate(lead.created_at) }}</p>
              </div>

              <div>
                <p class="text-sm text-gray-500">Ultima atualizacao</p>
                <p class="font-medium">{{ formatRelativeTime(lead.updated_at) }}</p>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <Teleport to="body">
      <div v-if="showEditForm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50" @click="showEditForm = false" />
        <div class="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 class="text-xl font-semibold">Editar Lead</h2>
            <button @click="showEditForm = false" class="p-2 hover:bg-gray-100 rounded-lg">
              <X class="w-5 h-5" />
            </button>
          </div>
          <div class="p-6">
            <LeadForm :lead="lead" :loading="formLoading" @submit="handleUpdate" @close="showEditForm = false" />
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirm Modal -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50" @click="showDeleteConfirm = false" />
        <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <h2 class="text-xl font-semibold mb-2">Excluir Lead</h2>
          <p class="text-gray-600 mb-6">Tem certeza que deseja excluir <strong>{{ lead?.name }}</strong>? Esta acao nao pode ser desfeita.</p>
          <div class="flex justify-end gap-3">
            <BaseButton variant="outline" @click="showDeleteConfirm = false">Cancelar</BaseButton>
            <BaseButton variant="danger" :loading="deleteLoading" @click="handleDelete">Excluir</BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>
