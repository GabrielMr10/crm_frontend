<script setup lang="ts">
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { Mail, Phone, MoreVertical, UserCheck, UserX } from 'lucide-vue-next'

const props = defineProps<{
  user: User
  currentUserId?: string
}>()

const emit = defineEmits<{
  (e: 'edit', user: User): void
  (e: 'toggle-status', user: User): void
  (e: 'delete', user: User): void
}>()

const showMenu = ref(false)

const roleLabels: Record<string, string> = {
  owner: 'Proprietário',
  admin: 'Administrador',
  manager: 'Gerente',
  member: 'Membro'
}

const roleColors: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  manager: 'bg-green-100 text-green-800',
  member: 'bg-gray-100 text-gray-800'
}

const isCurrentUser = computed(() => props.user.id === props.currentUserId)
const canShowMenu = computed(() => !isCurrentUser.value && props.user.role !== 'owner')

function getInitials(name: string): string {
  if (!name) return '??'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function toggleMenu(event: Event) {
  event.stopPropagation()
  showMenu.value = !showMenu.value
}

function onEdit() {
  showMenu.value = false
  emit('edit', props.user)
}

function onToggleStatus() {
  showMenu.value = false
  emit('toggle-status', props.user)
}

function onDelete() {
  showMenu.value = false
  emit('delete', props.user)
}
</script>

<template>
  <div
    :class="['bg-white border rounded-lg p-4 hover:shadow-md transition-all', !user.is_active && 'opacity-60']"
    @click="showMenu = false"
  >
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <!-- Avatar -->
        <div :class="['w-12 h-12 rounded-full flex items-center justify-center text-white font-medium', user.is_active ? 'bg-primary-600' : 'bg-gray-400']">
          {{ getInitials(user.full_name) }}
        </div>

        <div>
          <div class="flex items-center gap-2">
            <h3 class="font-semibold text-gray-900">{{ user.full_name }}</h3>
            <span v-if="isCurrentUser" class="text-xs text-gray-500">(você)</span>
          </div>
          <span :class="['text-xs px-2 py-0.5 rounded-full', roleColors[user.role] || roleColors.member]">
            {{ roleLabels[user.role] || user.role }}
          </span>
        </div>
      </div>

      <!-- Menu -->
      <div v-if="canShowMenu" class="relative">
        <button @click="toggleMenu" class="p-2 hover:bg-gray-100 rounded-lg">
          <MoreVertical class="w-4 h-4 text-gray-500" />
        </button>
        <div v-if="showMenu" class="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border py-1 z-20">
          <button @click="onEdit" class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">
            Editar
          </button>
          <button @click="onToggleStatus" class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">
            {{ user.is_active ? 'Desativar' : 'Ativar' }}
          </button>
          <button @click="onDelete" class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
            Excluir
          </button>
        </div>
      </div>
    </div>

    <div class="mt-3 space-y-1 text-sm text-gray-600">
      <div class="flex items-center gap-2">
        <Mail class="w-4 h-4 text-gray-400" />
        <span>{{ user.email }}</span>
      </div>
      <div v-if="user.phone" class="flex items-center gap-2">
        <Phone class="w-4 h-4 text-gray-400" />
        <span>{{ user.phone }}</span>
      </div>
    </div>

    <!-- Status -->
    <div class="mt-3 pt-3 border-t flex items-center justify-between">
      <div :class="['flex items-center gap-1 text-xs', user.is_active ? 'text-green-600' : 'text-gray-500']">
        <UserCheck v-if="user.is_active" class="w-3 h-3" />
        <UserX v-else class="w-3 h-3" />
        <span>{{ user.is_active ? 'Ativo' : 'Inativo' }}</span>
      </div>
    </div>
  </div>
</template>