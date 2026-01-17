<template>
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <router-link to="/settings" class="hover:text-blue-600">Configurações</router-link>
        <ChevronRight class="w-4 h-4" />
        <span class="text-gray-900">Meu Perfil</span>
      </div>
      <h1 class="text-2xl font-bold text-gray-900">Meu Perfil</h1>
      <p class="text-gray-600 mt-1">Gerencie suas informações pessoais</p>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <Loader2 class="w-8 h-8 animate-spin text-blue-600" />
    </div>

    <div v-else class="max-w-2xl space-y-6">
      <!-- Informações do Perfil -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Informações Pessoais</h2>

        <form @submit.prevent="handleUpdateProfile" class="space-y-4">
          <BaseInput
            v-model="profileForm.full_name"
            label="Nome completo"
            required
            :error="profileErrors.full_name"
          />

          <BaseInput
            v-model="profileForm.email"
            label="E-mail"
            type="email"
            required
            :error="profileErrors.email"
          />

          <BaseInput
            v-model="profileForm.phone"
            label="Telefone"
            v-maska="'(##) #####-####'"
            placeholder="(00) 00000-0000"
            :error="profileErrors.phone"
          />

          <div class="flex justify-end pt-2">
            <BaseButton
              type="submit"
              :loading="savingProfile"
              :disabled="!isProfileDirty"
            >
              <Save class="w-4 h-4 mr-2" />
              Salvar Alterações
            </BaseButton>
          </div>
        </form>
      </div>

      <!-- Alterar Senha -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Alterar Senha</h2>

        <form @submit.prevent="handleChangePassword" class="space-y-4">
          <BaseInput
            v-model="passwordForm.current_password"
            label="Senha atual"
            type="password"
            required
            :error="passwordErrors.current_password"
          />

          <BaseInput
            v-model="passwordForm.new_password"
            label="Nova senha"
            type="password"
            required
            :error="passwordErrors.new_password"
          />

          <BaseInput
            v-model="passwordForm.confirm_password"
            label="Confirmar nova senha"
            type="password"
            required
            :error="passwordErrors.confirm_password"
          />

          <div class="flex justify-end pt-2">
            <BaseButton
              type="submit"
              :loading="savingPassword"
              :disabled="!isPasswordFormFilled"
            >
              <Lock class="w-4 h-4 mr-2" />
              Alterar Senha
            </BaseButton>
          </div>
        </form>
      </div>

      <!-- Informações da Conta -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Informações da Conta</h2>

        <div class="space-y-3 text-sm">
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-gray-600">Função</span>
            <span class="font-medium text-gray-900">{{ getRoleName(user?.role) }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-gray-600">Status</span>
            <span
              class="px-2 py-0.5 rounded-full text-xs font-medium"
              :class="user?.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
            >
              {{ user?.is_active ? 'Ativo' : 'Inativo' }}
            </span>
          </div>
          <div class="flex justify-between py-2">
            <span class="text-gray-600">Membro desde</span>
            <span class="font-medium text-gray-900">{{ formatDate(user?.created_at ?? null) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { vMaska } from 'maska/vue'
import { ChevronRight, Loader2, Save, Lock } from 'lucide-vue-next'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/shared/components/BaseInput.vue'
import BaseButton from '@/shared/components/BaseButton.vue'
import { getProfile, updateProfile, changePassword } from '../api'
import type { User } from '@/types'
import { formatDate } from '@/shared/utils/formatters'

const uiStore = useUiStore()
const authStore = useAuthStore()

const loading = ref(true)
const savingProfile = ref(false)
const savingPassword = ref(false)
const user = ref<User | null>(null)

const profileForm = reactive({
  full_name: '',
  email: '',
  phone: ''
})

const originalProfile = reactive({
  full_name: '',
  email: '',
  phone: ''
})

const profileErrors = reactive({
  full_name: '',
  email: '',
  phone: ''
})

const passwordForm = reactive({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

const passwordErrors = reactive({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

const isProfileDirty = computed(() => {
  return profileForm.full_name !== originalProfile.full_name ||
    profileForm.email !== originalProfile.email ||
    profileForm.phone !== originalProfile.phone
})

const isPasswordFormFilled = computed(() => {
  return passwordForm.current_password &&
    passwordForm.new_password &&
    passwordForm.confirm_password
})

function getRoleName(role?: string): string {
  const roles: Record<string, string> = {
    owner: 'Proprietário',
    admin: 'Administrador',
    manager: 'Gerente',
    agent: 'Agente',
    member: 'Membro'
  }
  return role ? roles[role] || role : '-'
}

async function loadProfile() {
  try {
    loading.value = true
    user.value = await getProfile()

    profileForm.full_name = user.value.full_name
    profileForm.email = user.value.email
    profileForm.phone = user.value.phone || ''

    originalProfile.full_name = user.value.full_name
    originalProfile.email = user.value.email
    originalProfile.phone = user.value.phone || ''
  } catch (error) {
    uiStore.showToast('Erro ao carregar perfil', 'error')
  } finally {
    loading.value = false
  }
}

function validateProfile(): boolean {
  let valid = true
  profileErrors.full_name = ''
  profileErrors.email = ''
  profileErrors.phone = ''

  if (!profileForm.full_name.trim()) {
    profileErrors.full_name = 'Nome é obrigatório'
    valid = false
  }

  if (!profileForm.email.trim()) {
    profileErrors.email = 'E-mail é obrigatório'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
    profileErrors.email = 'E-mail inválido'
    valid = false
  }

  return valid
}

async function handleUpdateProfile() {
  if (!validateProfile()) return

  try {
    savingProfile.value = true
    const updated = await updateProfile({
      name: profileForm.full_name,
      email: profileForm.email,
      phone: profileForm.phone || undefined
    })

    user.value = updated
    originalProfile.full_name = updated.full_name
    originalProfile.email = updated.email
    originalProfile.phone = updated.phone || ''

    // Update auth store
    if (authStore.user) {
      authStore.user = updated
    }

    uiStore.showToast('Perfil atualizado com sucesso', 'success')
  } catch (error: any) {
    const message = error.response?.data?.detail || 'Erro ao atualizar perfil'
    uiStore.showToast(message, 'error')
  } finally {
    savingProfile.value = false
  }
}

function validatePassword(): boolean {
  let valid = true
  passwordErrors.current_password = ''
  passwordErrors.new_password = ''
  passwordErrors.confirm_password = ''

  if (!passwordForm.current_password) {
    passwordErrors.current_password = 'Senha atual é obrigatória'
    valid = false
  }

  if (!passwordForm.new_password) {
    passwordErrors.new_password = 'Nova senha é obrigatória'
    valid = false
  } else if (passwordForm.new_password.length < 8) {
    passwordErrors.new_password = 'Senha deve ter no mínimo 8 caracteres'
    valid = false
  }

  if (!passwordForm.confirm_password) {
    passwordErrors.confirm_password = 'Confirmação é obrigatória'
    valid = false
  } else if (passwordForm.new_password !== passwordForm.confirm_password) {
    passwordErrors.confirm_password = 'Senhas não conferem'
    valid = false
  }

  return valid
}

async function handleChangePassword() {
  if (!validatePassword()) return

  try {
    savingPassword.value = true
    await changePassword({
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password
    })

    // Clear form
    passwordForm.current_password = ''
    passwordForm.new_password = ''
    passwordForm.confirm_password = ''

    uiStore.showToast('Senha alterada com sucesso', 'success')
  } catch (error: any) {
    const message = error.response?.data?.detail || 'Erro ao alterar senha'
    if (message.includes('incorreta') || message.includes('invalid') || message.includes('wrong')) {
      passwordErrors.current_password = 'Senha atual incorreta'
    } else {
      uiStore.showToast(message, 'error')
    }
  } finally {
    savingPassword.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>