<script setup lang="ts">
import { ref, watch } from 'vue'
import { LeadStatus } from '@/types'
import { LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS } from '@/shared/utils/constants'
import { Search, X } from 'lucide-vue-next'
import { useDebounce } from '@/shared/composables/useDebounce'

const props = defineProps<{
  status?: LeadStatus
  source?: string
  search?: string
}>()

const emit = defineEmits<{
  (e: 'update:status', value: LeadStatus | undefined): void
  (e: 'update:source', value: string | undefined): void
  (e: 'update:search', value: string): void
  (e: 'clear'): void
}>()

const searchInput = ref(props.search || '')
const debouncedSearch = useDebounce(searchInput, 300)

watch(debouncedSearch, (value) => emit('update:search', value))

const hasFilters = () => props.status || props.source || props.search
</script>

<template>
  <div class="flex flex-col sm:flex-row gap-3">
    <!-- Search -->
    <div class="relative flex-1">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input v-model="searchInput" type="text" placeholder="Buscar por nome, email ou telefone..."
        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
    </div>

    <!-- Status Filter -->
    <select :value="status" @change="emit('update:status', ($event.target as HTMLSelectElement).value as LeadStatus || undefined)"
      class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
      <option value="">Todos os status</option>
      <option v-for="(label, key) in LEAD_STATUS_LABELS" :key="key" :value="key">{{ label }}</option>
    </select>

    <!-- Source Filter -->
    <select :value="source" @change="emit('update:source', ($event.target as HTMLSelectElement).value || undefined)"
      class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
      <option value="">Todas as origens</option>
      <option v-for="(label, key) in LEAD_SOURCE_LABELS" :key="key" :value="key">{{ label }}</option>
    </select>

    <!-- Clear Filters -->
    <button v-if="hasFilters()" @click="emit('clear')"
      class="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
      <X class="w-4 h-4" />
      <span class="hidden sm:inline">Limpar</span>
    </button>
  </div>
</template>
