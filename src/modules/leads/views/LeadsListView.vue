<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import AppLayout from '@/layouts/AppLayout.vue'
import { BaseButton, BaseCard } from '@/shared/components'
import LeadCard from '../components/LeadCard.vue'
import LeadFilters from '../components/LeadFilters.vue'
import LeadForm from '../components/LeadForm.vue'
import { getLeads, createLead, type LeadFilters as Filters } from '../api'
import type { Lead, LeadCreate } from '@/types'
import { Plus, Users, Loader2, X } from 'lucide-vue-next'

const router = useRouter()
const uiStore = useUiStore()

const loading = ref(false)
const leads = ref<Lead[]>([])
const pagination = ref({ total: 0, page: 1, pages: 1, per_page: 20 })
const showForm = ref(false)
const formLoading = ref(false)

const filters = reactive<Filters>({
  page: 1,
  per_page: 20,
  status: undefined,
  source: undefined,
  search: ''
})

async function loadLeads() {
  loading.value = true
  try {
    const response = await getLeads(filters)
    leads.value = response.items
    pagination.value = {
      total: response.total,
      page: response.page,
      pages: response.pages,
      per_page: response.per_page
    }
  } catch (err) {
    uiStore.showError('Erro', 'Falha ao carregar leads')
  } finally {
    loading.value = false
  }
}

async function handleCreate(data: LeadCreate | import('@/types').LeadUpdate) {
  formLoading.value = true
  try {
    await createLead(data as LeadCreate)
    uiStore.showSuccess('Sucesso', 'Lead criado com sucesso')
    showForm.value = false
    loadLeads()
  } catch (err: any) {
    uiStore.showError('Erro', err.response?.data?.detail || 'Falha ao criar lead')
  } finally {
    formLoading.value = false
  }
}

function goToLead(id: string) {
  router.push(`/leads/${id}`)
}

function clearFilters() {
  filters.status = undefined
  filters.source = undefined
  filters.search = ''
  filters.page = 1
}

function changePage(page: number) {
  filters.page = page
}

watch(() => [filters.status, filters.source, filters.search], () => {
  filters.page = 1
  loadLeads()
})

watch(() => filters.page, () => loadLeads())

onMounted(() => loadLeads())
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Leads</h1>
          <p class="text-gray-500">{{ pagination.total }} leads no total</p>
        </div>
        <BaseButton @click="showForm = true">
          <Plus class="w-4 h-4 mr-2" />
          Novo Lead
        </BaseButton>
      </div>

      <!-- Filters -->
      <LeadFilters
        v-model:status="filters.status"
        v-model:source="filters.source"
        v-model:search="filters.search"
        @clear="clearFilters"
      />

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <Loader2 class="w-8 h-8 text-primary-600 animate-spin" />
      </div>

      <!-- Empty State -->
      <BaseCard v-else-if="leads.length === 0">
        <div class="text-center py-12">
          <Users class="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhum lead encontrado</h3>
          <p class="text-gray-500 mb-4">Comece criando seu primeiro lead</p>
          <BaseButton @click="showForm = true">
            <Plus class="w-4 h-4 mr-2" />
            Novo Lead
          </BaseButton>
        </div>
      </BaseCard>

      <!-- Lead Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <LeadCard
          v-for="lead in leads"
          :key="lead.id"
          :lead="lead"
          @click="goToLead"
        />
      </div>

      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="flex justify-center gap-2">
        <BaseButton
          v-for="page in pagination.pages"
          :key="page"
          :variant="page === pagination.page ? 'primary' : 'outline'"
          size="sm"
          @click="changePage(page)"
        >
          {{ page }}
        </BaseButton>
      </div>
    </div>

    <!-- Create Modal -->
    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50" @click="showForm = false" />
        <div class="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 class="text-xl font-semibold">Novo Lead</h2>
            <button @click="showForm = false" class="p-2 hover:bg-gray-100 rounded-lg">
              <X class="w-5 h-5" />
            </button>
          </div>
          <div class="p-6">
            <LeadForm :loading="formLoading" @submit="handleCreate" @close="showForm = false" />
          </div>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>
