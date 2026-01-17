<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { BaseButton } from '@/shared/components'
import { Building2, User, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-vue-next'
import { vMaska } from 'maska/vue'
import { isStrongPassword } from '@/shared/utils/validators'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const form = ref({ company_name: '', full_name: '', email: '', password: '', confirmPassword: '', phone: '' })
const showPassword = ref(false)
const errors = ref<Record<string, string>>({})
const acceptTerms = ref(false)

const isValid = computed(() => form.value.company_name && form.value.full_name && form.value.email && form.value.password && acceptTerms.value)

function validate() {
  errors.value = {}
  if (!form.value.company_name || form.value.company_name.length < 2) errors.value.company_name = 'Minimo 2 caracteres'
  if (!form.value.full_name || form.value.full_name.length < 2) errors.value.full_name = 'Minimo 2 caracteres'
  if (!form.value.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) errors.value.email = 'Email invalido'
  const pwdCheck = isStrongPassword(form.value.password)
  if (!pwdCheck.valid) errors.value.password = pwdCheck.message!
  if (form.value.password !== form.value.confirmPassword) errors.value.confirmPassword = 'Senhas nao coincidem'
  return Object.keys(errors.value).length === 0
}

async function submit() {
  if (!validate()) return
  const success = await authStore.register({
    company_name: form.value.company_name,
    full_name: form.value.full_name,
    email: form.value.email,
    password: form.value.password,
    phone: form.value.phone.replace(/\D/g, '') || undefined
  })
  if (success) {
    uiStore.showSuccess('Conta criada!', 'Bem-vindo ao CRM')
    router.push('/')
  } else {
    uiStore.showError('Erro', authStore.error || 'Tente novamente')
  }
}
</script>

<template>
  <AuthLayout>
    <div class="bg-white rounded-2xl shadow-xl p-8">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold">Criar conta</h2>
        <p class="text-gray-500 mt-1">Comece em minutos</p>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Empresa</label>
          <div class="relative">
            <Building2 class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input v-model="form.company_name" placeholder="Minha Empresa"
              :class="['w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500', errors.company_name ? 'border-red-300' : 'border-gray-300']" />
          </div>
          <p v-if="errors.company_name" class="mt-1 text-sm text-red-600">{{ errors.company_name }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Seu nome</label>
          <div class="relative">
            <User class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input v-model="form.full_name" placeholder="Joao Silva"
              :class="['w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500', errors.full_name ? 'border-red-300' : 'border-gray-300']" />
          </div>
          <p v-if="errors.full_name" class="mt-1 text-sm text-red-600">{{ errors.full_name }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <div class="relative">
            <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input v-model="form.email" type="email" placeholder="seu@email.com"
              :class="['w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500', errors.email ? 'border-red-300' : 'border-gray-300']" />
          </div>
          <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Telefone (opcional)</label>
          <div class="relative">
            <Phone class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input v-model="form.phone" v-maska="'(##) #####-####'" placeholder="(41) 99999-9999"
              class="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Senha</label>
          <div class="relative">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="Minimo 8 caracteres"
              :class="['w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500', errors.password ? 'border-red-300' : 'border-gray-300']" />
            <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2">
              <component :is="showPassword ? EyeOff : Eye" class="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Confirmar senha</label>
          <div class="relative">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input v-model="form.confirmPassword" :type="showPassword ? 'text' : 'password'" placeholder="Repita a senha"
              :class="['w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500', errors.confirmPassword ? 'border-red-300' : 'border-gray-300']" />
          </div>
          <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
        </div>

        <label class="flex items-center gap-2">
          <input v-model="acceptTerms" type="checkbox" class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
          <span class="text-sm">Aceito os termos de uso</span>
        </label>

        <BaseButton type="submit" :loading="authStore.loading" :disabled="!isValid" block size="lg">Criar conta</BaseButton>
      </form>

      <p class="mt-4 text-center text-sm text-gray-500">
        Ja tem conta? <RouterLink to="/login" class="text-primary-600 font-medium hover:underline">Entrar</RouterLink>
      </p>
    </div>
  </AuthLayout>
</template>
