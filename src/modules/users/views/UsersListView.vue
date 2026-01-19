<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import AppLayout from '@/layouts/AppLayout.vue'
import { BaseButton, BaseCard } from '@/shared/components'
import UserCard from '../components/UserCard.vue'
import UserForm from '../components/UserForm.vue'
import { getUsers, createUser, updateUser, deleteUser, activateUser, deactivateUser, type UserCreate, type UserUpdate } from '../api'
import type { User } from '@/types'
import { Plus, Users, Loader2, X } from 'lucide-vue-next'

const authStore = useAuthStore()
const uiStore = useUiStore()

const loading = ref(true)
const users = ref<User[]>([])
const showForm = ref(false)
const selectedUser = ref<User | null>(null)
const formLoading = ref(false)
const showDeleteConfirm = ref(false)
const userToDelete = ref<User | null>(null)
const deleteLoading = ref(false)

async function loadUsers() {
  loading.value = true
  try {
    users.value = await getUsers()
  } catch (err: any) {
    console.error('Erro ao carregar usuários:', err)
    uiStore.showError('Erro', err.response?.data?.detail || 'Falha ao carregar usuários')
    users.value = []
  } finally {
    loading.value = false
  }
}

function openCreateForm() {
  selectedUser.value = null
  showForm.value = true
}

function openEditForm(user: User) {
  selectedUser.value = user
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  selectedUser.value = null
}

async function handleSubmit(data: UserCreate | UserUpdate) {
  formLoading.value = true
  try {
    if (selectedUser.value) {
      await updateUser(selectedUser.value.id, data as UserUpdate)
      uiStore.showSuccess('Usuário atualizado')
    } else {
      await createUser(data as UserCreate)
      uiStore.showSuccess('Usuário criado')
    }
    closeForm()
    await loadUsers()
  } catch (err: any) {
    uiStore.showError('Erro', err.response?.data?.detail || 'Falha ao salvar')
  } finally {
    formLoading.value = false
  }
}

async function handleToggleStatus(user: User) {
  try {
    if (user.is_active) {
      await deactivateUser(user.id)
      uiStore.showSuccess('Usuário desativado')
    } else {
      await activateUser(user.id)
      uiStore.showSuccess('Usuário ativado')
    }
    await loadUsers()
  } catch (err: any) {
    uiStore.showError('Erro', err.response?.data?.detail || 'Falha ao alterar status')
  }
}

function confirmDelete(user: User) {
  userToDelete.value = user
  showDeleteConfirm.value = true
}

function closeDeleteConfirm() {
  showDeleteConfirm.value = false
  userToDelete.value = null
}

async function handleDelete() {
  if (!userToDelete.value) return
  deleteLoading.value = true
  try {
    await deleteUser(userToDelete.value.id)
    uiStore.showSuccess('Usuário excluído')
    closeDeleteConfirm()
    await loadUsers()
  } catch (err: any) {
    uiStore.showError('Erro', err.response?.data?.detail || 'Falha ao excluir')
  } finally {
    deleteLoading.value = false
  }
}

onMounted(loadUsers)
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Equipe</h1>
          <p class="text-gray-500">{{ users.length }} usuários cadastrados</p>
        </div>
        <BaseButton @click="openCreateForm">
          <Plus class="w-4 h-4 mr-2" />
          Novo Usuário
        </BaseButton>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <Loader2 class="w-8 h-8 text-primary-600 animate-spin" />
      </div>

      <!-- Empty State -->
      <BaseCard v-else-if="users.length === 0">
        <div class="text-center py-12">
          <Users class="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhum usuário</h3>
          <p class="text-gray-500 mb-4">Adicione membros da sua equipe</p>
          <BaseButton @click="openCreateForm">
            <Plus class="w-4 h-4 mr-2" />
            Novo Usuário
          </BaseButton>
        </div>
      </BaseCard>

      <!-- User Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UserCard
          v-for="user in users"
          :key="user.id"
          :user="user"
          :current-user-id="authStore.user?.id"
          @edit="openEditForm"
          @toggle-status="handleToggleStatus"
          @delete="confirmDelete"
        />
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/50" @click="closeForm" />
      <div class="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 class="text-xl font-semibold">{{ selectedUser ? 'Editar Usuário' : 'Novo Usuário' }}</h2>
          <button @click="closeForm" class="p-2 hover:bg-gray-100 rounded-lg">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6">
          <UserForm
            :user="selectedUser"
            :loading="formLoading"
            @submit="handleSubmit"
            @close="closeForm"
          />
        </div>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/50" @click="closeDeleteConfirm" />
      <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 class="text-xl font-semibold mb-2">Excluir Usuário</h2>
        <p class="text-gray-600 mb-6">
          Tem certeza que deseja excluir <strong>{{ userToDelete?.full_name }}</strong>?
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