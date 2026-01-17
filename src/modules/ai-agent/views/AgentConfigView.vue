<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUiStore } from '@/stores/ui'
import AppLayout from '@/layouts/AppLayout.vue'
import { BaseButton, BaseCard } from '@/shared/components'
import { getAgentConfig, updateAgentConfig, toggleAgent } from '../api'
import type { AgentConfig } from '@/types'
import { Bot, Loader2, Save } from 'lucide-vue-next'

const uiStore = useUiStore()

const loading = ref(true)
const saving = ref(false)
const config = ref<AgentConfig | null>(null)

const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']

async function loadConfig() {
  try {
    config.value = await getAgentConfig()
  } catch {
    uiStore.showError('Erro', 'Falha ao carregar configuracao')
  } finally {
    loading.value = false
  }
}

async function handleToggle() {
  if (!config.value) return
  try {
    const result = await toggleAgent()
    config.value.is_enabled = result.is_enabled
    uiStore.showSuccess(result.is_enabled ? 'Laura ativada!' : 'Laura desativada')
  } catch {
    uiStore.showError('Erro', 'Falha ao alterar status')
  }
}

async function saveConfig() {
  if (!config.value) return
  saving.value = true
  try {
    config.value = await updateAgentConfig({
      agent_name: config.value.agent_name,
      agent_role: config.value.agent_role,
      company_name: config.value.company_name ?? undefined,
      schedule_enabled: config.value.schedule_enabled,
      schedule_start: config.value.schedule_start ?? undefined,
      schedule_end: config.value.schedule_end ?? undefined,
      schedule_days: config.value.schedule_days,
      base_prompt: config.value.base_prompt ?? undefined
    })
    uiStore.showSuccess('Salvo!', 'Configuracoes atualizadas')
  } catch {
    uiStore.showError('Erro', 'Falha ao salvar')
  } finally {
    saving.value = false
  }
}

function toggleDay(day: number) {
  if (!config.value) return
  const idx = config.value.schedule_days.indexOf(day)
  if (idx >= 0) {
    config.value.schedule_days.splice(idx, 1)
  } else {
    config.value.schedule_days.push(day)
  }
}

onMounted(loadConfig)
</script>

<template>
  <AppLayout>
    <div v-if="loading" class="flex justify-center py-12">
      <Loader2 class="w-8 h-8 text-primary-600 animate-spin" />
    </div>

    <div v-else-if="config" class="space-y-6 max-w-4xl">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold flex items-center gap-3">
            <Bot class="w-8 h-8 text-primary-600" />
            Configuracao da IA
          </h1>
          <p class="text-gray-500 mt-1">Configure a Laura, sua assistente virtual</p>
        </div>
        <div class="flex items-center gap-4">
          <span :class="['text-sm font-medium', config.is_enabled ? 'text-green-600' : 'text-gray-500']">
            {{ config.is_enabled ? 'Ativa' : 'Desativada' }}
          </span>
          <button @click="handleToggle"
            :class="['relative w-14 h-7 rounded-full transition-colors', config.is_enabled ? 'bg-green-500' : 'bg-gray-300']">
            <span :class="['absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform', config.is_enabled ? 'left-8' : 'left-1']" />
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Identidade -->
        <BaseCard title="Identidade">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome da IA</label>
              <input v-model="config.agent_name" type="text" placeholder="Laura"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Cargo/Funcao</label>
              <input v-model="config.agent_role" type="text" placeholder="Assistente de Vendas"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
              <input v-model="config.company_name" type="text" placeholder="Sua Empresa"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
        </BaseCard>

        <!-- Horario -->
        <BaseCard title="Horario de Atendimento">
          <div class="space-y-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="config.schedule_enabled" type="checkbox" class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              <span class="text-sm">Ativar horario de funcionamento</span>
            </label>

            <div v-if="config.schedule_enabled" class="space-y-4">
              <div class="flex gap-4">
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Inicio</label>
                  <input v-model="config.schedule_start" type="time"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Fim</label>
                  <input v-model="config.schedule_end" type="time"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Dias ativos</label>
                <div class="flex gap-2">
                  <button v-for="(day, i) in daysOfWeek" :key="i" @click="toggleDay(i)" type="button"
                    :class="['w-10 h-10 rounded-lg text-sm font-medium transition-colors', config.schedule_days.includes(i) ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']">
                    {{ day }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- Comportamento -->
        <BaseCard title="Comportamento">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Max. mensagens antes de humano</label>
              <input v-model.number="config.max_messages_before_human" type="number" min="1" max="50"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
              <p class="text-xs text-gray-500 mt-1">Apos esse numero, a conversa e transferida para um humano</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Delay de resposta (segundos)</label>
              <input v-model.number="config.response_delay_seconds" type="number" min="0" max="30"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
              <p class="text-xs text-gray-500 mt-1">Tempo de espera antes de responder (simula digitacao)</p>
            </div>
          </div>
        </BaseCard>

        <!-- Info do Modelo -->
        <BaseCard title="Modelo de IA">
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Provedor</span>
              <span class="font-medium">{{ config.llm_provider }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Modelo</span>
              <span class="font-medium">{{ config.llm_model }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Temperatura</span>
              <span class="font-medium">{{ config.llm_temperature }}</span>
            </div>
          </div>
        </BaseCard>

        <!-- Prompt -->
        <BaseCard title="Prompt Base" class="lg:col-span-2">
          <div>
            <p class="text-sm text-gray-500 mb-2">Instrucoes personalizadas para a IA seguir durante as conversas</p>
            <textarea v-model="config.base_prompt" rows="8" placeholder="Instrucoes para a IA..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none font-mono text-sm focus:ring-2 focus:ring-primary-500" />
          </div>
        </BaseCard>
      </div>

      <!-- Save Button -->
      <div class="flex justify-end">
        <BaseButton @click="saveConfig" :loading="saving">
          <Save class="w-4 h-4 mr-2" />
          Salvar Configuracoes
        </BaseButton>
      </div>
    </div>
  </AppLayout>
</template>
