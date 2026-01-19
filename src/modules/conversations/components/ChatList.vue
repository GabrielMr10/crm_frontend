<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Conversation, User } from '@/types'
import { formatPhone, formatRelativeTime } from '@/shared/utils/formatters'
import { MessageSquare, Bot, Filter, X } from 'lucide-vue-next'

const props = defineProps<{
  conversations: Conversation[]
  selectedId?: string
  loading?: boolean
  users?: User[]
}>()

const emit = defineEmits<{
  (e: 'select', conversation: Conversation): void
}>()

const filterByUser = ref<string | null>(null)
const showFilters = ref(false)
const searchQuery = ref('')

const filteredConversations = computed(() => {
  let result = props.conversations

  // Filtro por atendente
  if (filterByUser.value) {
    if (filterByUser.value === 'unassigned') {
      result = result.filter(c => !c.assigned_to_id)
    } else {
      result = result.filter(c => c.assigned_to_id === filterByUser.value)
    }
  }

  // Filtro por busca
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(c =>
      c.contact_name?.toLowerCase().includes(query) ||
      c.phone.includes(query) ||
      c.last_message_text?.toLowerCase().includes(query)
    )
  }

  return result
})

function setFilter(userId: string | null) {
  filterByUser.value = userId
  showFilters.value = false
}

function clearFilter() {
  filterByUser.value = null
}

function getInitials(name: string | null): string {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function getUserName(userId: string | null): string {
  if (!userId || !props.users) return 'Não atribuído'
  const user = props.users.find(u => u.id === userId)
  return user?.full_name || 'Desconhecido'
}
</script>

<template>
  <div class="h-full flex flex-col bg-white border-r">
    <div class="p-4 border-b flex items-center justify-between">
      <h2 class="text-lg font-semibold">Conversas</h2>

      <!-- Filtro por atendente -->
      <div class="relative">
        <button @click="showFilters = !showFilters"
          :class="['p-2 rounded-lg transition-colors', filterByUser ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100']">
          <Filter class="w-5 h-5" />
        </button>

        <!-- Dropdown de filtros -->
        <div v-if="showFilters" class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-1 z-20">
          <div class="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Filtrar por atendente</div>

          <button @click="setFilter(null)"
            :class="['w-full px-4 py-2 text-left text-sm hover:bg-gray-100', !filterByUser && 'bg-primary-50 text-primary-600']">
            Todos
          </button>

          <button @click="setFilter('unassigned')"
            :class="['w-full px-4 py-2 text-left text-sm hover:bg-gray-100', filterByUser === 'unassigned' && 'bg-primary-50 text-primary-600']">
            Não atribuídos
          </button>

          <hr class="my-1" />

          <button v-for="user in users" :key="user.id" @click="setFilter(user.id)"
            :class="['w-full px-4 py-2 text-left text-sm hover:bg-gray-100', filterByUser === user.id && 'bg-primary-50 text-primary-600']">
            {{ user.full_name }}
          </button>
        </div>
      </div>
    </div>

    <!-- Filtro ativo -->
    <div v-if="filterByUser" class="px-3 py-2 bg-primary-50 flex items-center justify-between">
      <span class="text-sm text-primary-700">
        Filtrado: {{ filterByUser === 'unassigned' ? 'Não atribuídos' : getUserName(filterByUser) }}
      </span>
      <button @click="clearFilter" class="p-1 hover:bg-primary-100 rounded">
        <X class="w-4 h-4 text-primary-600" />
      </button>
    </div>

    <div class="p-3 border-b">
      <input v-model="searchQuery" type="text" placeholder="Buscar..."
        class="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white" />
    </div>

    <!-- List -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="loading" class="p-4 text-center text-gray-500">Carregando...</div>
      <div v-else-if="!filteredConversations.length" class="p-4 text-center text-gray-500">
        <MessageSquare class="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>Nenhuma conversa</p>
      </div>
      <button v-else v-for="conv in filteredConversations" :key="conv.id" @click="emit('select', conv)"
        :class="['w-full p-3 flex items-start gap-3 hover:bg-gray-50 text-left border-b transition-colors', conv.id === selectedId ? 'bg-primary-50' : '']">
        <div class="relative">
          <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-medium text-gray-600">
            {{ getInitials(conv.contact_name) }}
          </div>
          <div v-if="conv.is_bot_active" class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <Bot class="w-3 h-3 text-white" />
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between mb-1">
            <span class="font-medium truncate">{{ conv.contact_name || formatPhone(conv.phone) }}</span>
            <span class="text-xs text-gray-500 flex-shrink-0">{{ formatRelativeTime(conv.last_message_at) }}</span>
          </div>
          <p class="text-sm text-gray-500 truncate">{{ conv.last_message_text || 'Sem mensagens' }}</p>

          <!-- Atendente responsável -->
          <p v-if="conv.assigned_to_id" class="text-xs text-gray-400 mt-1">
            Atendente: {{ getUserName(conv.assigned_to_id) }}
          </p>

          <span v-if="conv.unread_count" class="inline-block mt-1 px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
            {{ conv.unread_count }}
          </span>
        </div>
      </button>
    </div>
  </div>

  <!-- Click outside to close -->
  <div v-if="showFilters" class="fixed inset-0 z-10" @click="showFilters = false" />
</template>
