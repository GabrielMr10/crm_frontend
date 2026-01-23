<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { User, Bot, MessageSquare, Bell, Building, ChevronRight } from 'lucide-vue-next'
import { getWhatsAppStatus } from '../api'
import type { WhatsAppStatus } from '@/types'

const whatsappStatus = ref<WhatsAppStatus | null>(null)
const loadingWhatsapp = ref(true)

onMounted(async () => {
  try {
    whatsappStatus.value = await getWhatsAppStatus()
  } catch (e) {
    console.error('Erro ao carregar status WhatsApp:', e)
  } finally {
    loadingWhatsapp.value = false
  }
})
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Configuracoes</h1>
      <p class="text-gray-600 mt-1">Gerencie suas preferencias e configuracoes da conta</p>
    </div>

    <div class="max-w-2xl space-y-4">
      <router-link
        to="/settings/profile"
        class="block bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <User class="w-6 h-6 text-blue-600" />
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">Meu Perfil</h3>
            <p class="text-sm text-gray-600">Edite suas informacoes pessoais e altere sua senha</p>
          </div>
          <ChevronRight class="w-5 h-5 text-gray-400" />
        </div>
      </router-link>

      <router-link
        to="/ai-agent"
        class="block bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Bot class="w-6 h-6 text-purple-600" />
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">Agente de IA</h3>
            <p class="text-sm text-gray-600">Configure o comportamento e horarios do agente</p>
          </div>
          <ChevronRight class="w-5 h-5 text-gray-400" />
        </div>
      </router-link>

      <!-- WhatsApp Integration - HABILITADO -->
      <router-link
        to="/settings/whatsapp"
        class="block bg-white rounded-lg border border-gray-200 p-4 hover:border-green-300 hover:shadow-sm transition-all"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <MessageSquare class="w-6 h-6 text-green-600" />
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">WhatsApp</h3>
            <p class="text-sm text-gray-600">
              {{ loadingWhatsapp ? 'Verificando...' : (whatsappStatus?.connected ? 'Conectado' : 'Clique para conectar') }}
            </p>
          </div>
          <div class="flex items-center gap-3">
            <!-- Indicador de Status -->
            <div
              :class="[
                'w-3 h-3 rounded-full',
                loadingWhatsapp ? 'bg-gray-300 animate-pulse' : (whatsappStatus?.connected ? 'bg-green-500' : 'bg-gray-300')
              ]"
            />
            <ChevronRight class="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </router-link>

      <div class="block bg-white rounded-lg border border-gray-200 p-4 opacity-60 cursor-not-allowed">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <Bell class="w-6 h-6 text-orange-600" />
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">Notificacoes</h3>
            <p class="text-sm text-gray-600">Gerencie como e quando receber alertas</p>
            <span class="inline-block mt-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Em breve</span>
          </div>
          <ChevronRight class="w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div class="block bg-white rounded-lg border border-gray-200 p-4 opacity-60 cursor-not-allowed">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <Building class="w-6 h-6 text-gray-600" />
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">Empresa</h3>
            <p class="text-sm text-gray-600">Configure dados da empresa e equipe</p>
            <span class="inline-block mt-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Em breve</span>
          </div>
          <ChevronRight class="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </div>
  </div>
</template>