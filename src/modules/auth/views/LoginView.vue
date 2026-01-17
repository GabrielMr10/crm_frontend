<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { BaseButton } from '@/shared/components'
import { Mail, Lock, Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const uiStore = useUiStore()

const form = ref({ email: '', password: '' })
const showPassword = ref(false)
const errors = ref<Record<string, string>>({})

const isValid = computed(() => form.value.email && form.value.password)

function validate() {
  errors.value = {}
  if (!form.value.email) errors.value.email = 'Email obrigatorio'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) errors.value.email = 'Email invalido'
  if (!form.value.password) errors.value.password = 'Senha obrigatoria'
  return Object.keys(errors.value).length === 0
}

async function submit() {
  if (!validate()) return
  const success = await authStore.login(form.value)
  if (success) {
    uiStore.showSuccess('Bem-vindo!', `Ola, ${authStore.userFullName}`)
    router.push((route.query.redirect as string) || '/')
  } else {
    uiStore.showError('Erro', authStore.error || 'Credenciais invalidas')
  }
}
</script>

<template>
  <AuthLayout>
    <div class="bg-white rounded-2xl shadow-xl p-8">
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-gray-900">Bem-vindo!</h2>
        <p class="text-gray-500 mt-2">Entre com suas credenciais</p>
      </div>

      <form @submit.prevent="submit" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div class="relative">
            <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input v-model="form.email" type="email" placeholder="seu@email.com"
              :class="['w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500', errors.email ? 'border-red-300' : 'border-gray-300']" />
          </div>
          <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
          <div class="relative">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••"
              :class="['w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500', errors.password ? 'border-red-300' : 'border-gray-300']" />
            <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2">
              <EyeOff v-if="showPassword" class="w-5 h-5 text-gray-400" />
              <Eye v-else class="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
        </div>

        <BaseButton type="submit" :loading="authStore.loading" :disabled="!isValid" block size="lg">Entrar</BaseButton>
      </form>

      <p class="mt-6 text-center text-sm text-gray-500">
        Nao tem conta? <RouterLink to="/register" class="text-primary-600 font-medium hover:underline">Criar gratis</RouterLink>
      </p>
    </div>
  </AuthLayout>
</template>
