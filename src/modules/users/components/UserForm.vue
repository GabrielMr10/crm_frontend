<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { User } from '@/types'
import type { UserCreate, UserUpdate } from '../api'
import { BaseButton } from '@/shared/components'
import { vMaska } from 'maska/vue'

const props = defineProps<{
  user?: User | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', data: UserCreate | UserUpdate): void
  (e: 'close'): void
}>()

const isEditing = computed(() => !!props.user)

const form = ref({
  full_name: '',
  email: '',
  password: '',
  phone: '',
  role: 'member' as 'admin' | 'manager' | 'member'
})

watch(() => props.user, (user) => {
  if (user) {
    form.value = {
      full_name: user.full_name,
      email: user.email,
      password: '',
      phone: user.phone || '',
      role: (user.role as 'admin' | 'manager' | 'member') || 'member'
    }
  } else {
    form.value = { full_name: '', email: '', password: '', phone: '', role: 'member' }
  }
}, { immediate: true })

const errors = ref<Record<string, string>>({})

function validate(): boolean {
  errors.value = {}
  if (!form.value.full_name || form.value.full_name.length < 2) {
    errors.value.full_name = 'Nome obrigatório (mín. 2 caracteres)'
  }
  if (!form.value.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Email inválido'
  }
  if (!isEditing.value && (!form.value.password || form.value.password.length < 8)) {
    errors.value.password = 'Senha obrigatória (mín. 8 caracteres)'
  }
  return Object.keys(errors.value).length === 0
}

function submit() {
  if (!validate()) return

  if (isEditing.value) {
    emit('submit', {
      full_name: form.value.full_name,
      phone: form.value.phone || undefined,
      role: form.value.role
    } as UserUpdate)
  } else {
    emit('submit', {
      full_name: form.value.full_name,
      email: form.value.email,
      password: form.value.password,
      phone: form.value.phone || undefined,
      role: form.value.role
    } as UserCreate)
  }
}

const roles = [
  { value: 'admin', label: 'Administrador', description: 'Acesso total, pode gerenciar usuários' },
  { value: 'manager', label: 'Gerente', description: 'Pode ver relatórios e gerenciar leads' },
  { value: 'member', label: 'Membro', description: 'Acesso básico, atendimento' }
]
</script>

<template>
  <form @submit.prevent="submit" class="space-y-4">
    <!-- Nome -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
      <input v-model="form.full_name" type="text" placeholder="Nome do funcionário"
        :class="['w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500', errors.full_name ? 'border-red-300' : 'border-gray-300']" />
      <p v-if="errors.full_name" class="mt-1 text-sm text-red-600">{{ errors.full_name }}</p>
    </div>

    <!-- Email -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
      <input v-model="form.email" type="email" placeholder="email@empresa.com" :disabled="isEditing"
        :class="['w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500', errors.email ? 'border-red-300' : 'border-gray-300', isEditing && 'bg-gray-100 cursor-not-allowed']" />
      <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
      <p v-if="isEditing" class="mt-1 text-xs text-gray-500">Email não pode ser alterado</p>
    </div>

    <!-- Senha (apenas criação) -->
    <div v-if="!isEditing">
      <label class="block text-sm font-medium text-gray-700 mb-1">Senha *</label>
      <input v-model="form.password" type="password" placeholder="Mínimo 8 caracteres"
        :class="['w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500', errors.password ? 'border-red-300' : 'border-gray-300']" />
      <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
    </div>

    <!-- Telefone -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
      <input v-model="form.phone" v-maska="'(##) #####-####'" placeholder="(41) 99999-9999"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
    </div>

    <!-- Role -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Função *</label>
      <div class="space-y-2">
        <label v-for="role in roles" :key="role.value"
          :class="['flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors',
            form.role === role.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300']">
          <input v-model="form.role" type="radio" :value="role.value" class="mt-1" />
          <div>
            <p class="font-medium">{{ role.label }}</p>
            <p class="text-sm text-gray-500">{{ role.description }}</p>
          </div>
        </label>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-3 pt-4 border-t">
      <BaseButton type="button" variant="outline" @click="emit('close')">Cancelar</BaseButton>
      <BaseButton type="submit" :loading="loading">
        {{ isEditing ? 'Salvar' : 'Criar Usuário' }}
      </BaseButton>
    </div>
  </form>
</template>