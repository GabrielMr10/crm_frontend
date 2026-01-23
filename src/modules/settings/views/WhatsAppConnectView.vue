<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { useWebSocketStore } from '@/stores/websocket'
import AppLayout from '@/layouts/AppLayout.vue'
import { BaseButton, BaseCard } from '@/shared/components'
import QRCodeDisplay from '../components/QRCodeDisplay.vue'
import ConnectionStatus from '../components/ConnectionStatus.vue'
import {
  getWhatsAppStatus,
  connectWhatsApp,
  refreshQRCode,
  disconnectWhatsApp
} from '../api'
import type { WhatsAppStatus, WhatsAppQRCode } from '@/types'
import type { WebSocketMessage } from '@/core/websocket'

import {
  ArrowLeft,
  MessageSquare,
  RefreshCw,
  LogOut,
  Loader2,
  CheckCircle,
  Wifi,
  WifiOff
} from 'lucide-vue-next'

const router = useRouter()
const uiStore = useUiStore()
const wsStore = useWebSocketStore()

// Estado
const loading = ref(true)
const actionLoading = ref(false)
const status = ref<WhatsAppStatus | null>(null)
const qrCode = ref<WhatsAppQRCode | null>(null)
const qrExpired = ref(false)
const pollingInterval = ref<ReturnType<typeof setInterval> | null>(null)

// Computed
const isConnected = computed(() => status.value?.connected === true)

// === FUNCOES ===

async function loadStatus() {
  try {
    status.value = await getWhatsAppStatus()
  } catch (e) {
    console.error('Erro ao carregar status:', e)
  }
}

async function handleConnect() {
  actionLoading.value = true
  qrExpired.value = false

  try {
    const response = await connectWhatsApp()

    if (response.status === 'already_connected') {
      status.value = response.connection || null
      uiStore.showSuccess('WhatsApp ja esta conectado!')
    } else if (response.status === 'qrcode_ready' && response.qrcode) {
      qrCode.value = response.qrcode
      startPolling()
    }
  } catch (e: any) {
    uiStore.showError('Erro', e.response?.data?.detail || 'Falha ao conectar')
  } finally {
    actionLoading.value = false
    loading.value = false
  }
}

async function handleRefreshQR() {
  actionLoading.value = true
  qrExpired.value = false

  try {
    qrCode.value = await refreshQRCode()
  } catch (e: any) {
    uiStore.showError('Erro', e.response?.data?.detail || 'Falha ao atualizar QR')
  } finally {
    actionLoading.value = false
  }
}

async function handleDisconnect() {
  if (!confirm('Tem certeza que deseja desconectar o WhatsApp?')) return

  actionLoading.value = true

  try {
    await disconnectWhatsApp()
    status.value = { ...status.value!, connected: false, state: 'close' }
    qrCode.value = null
    uiStore.showSuccess('WhatsApp desconectado')
  } catch (e: any) {
    uiStore.showError('Erro', e.response?.data?.detail || 'Falha ao desconectar')
  } finally {
    actionLoading.value = false
  }
}

function goToConversations() {
  router.push('/conversations')
}

// === POLLING (fallback se WebSocket nao estiver funcionando) ===

function startPolling() {
  stopPolling()

  pollingInterval.value = setInterval(async () => {
    await loadStatus()

    if (isConnected.value) {
      stopPolling()
      qrCode.value = null
      uiStore.showSuccess('WhatsApp conectado com sucesso!')
    }
  }, 3000) // Verifica a cada 3 segundos

  // Expira QR apos 60 segundos
  setTimeout(() => {
    if (!isConnected.value && qrCode.value) {
      qrExpired.value = true
      stopPolling()
    }
  }, 60000)
}

function stopPolling() {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
    pollingInterval.value = null
  }
}

// === WEBSOCKET HANDLERS ===

function handleWSConnectionUpdate(data: WebSocketMessage) {
  console.log('[WhatsApp] Connection Update:', data)

  if (data.connected) {
    status.value = {
      instance: status.value?.instance || '',
      state: 'open',
      connected: true
    }
    qrCode.value = null
    stopPolling()
    uiStore.showSuccess('WhatsApp conectado com sucesso!')
  } else {
    status.value = {
      instance: status.value?.instance || '',
      state: (data.state as any) || 'close',
      connected: false
    }
  }
}

function handleWSQRCodeUpdate(data: WebSocketMessage) {
  console.log('[WhatsApp] QR Code Update:', data)

  if (data.base64) {
    qrCode.value = {
      instance: status.value?.instance || '',
      base64: data.base64 as string,
      pairingCode: data.pairingCode as string | undefined
    }
    qrExpired.value = false
  }
}

// === LIFECYCLE ===

onMounted(async () => {
  // Registra handlers WebSocket
  wsStore.on('whatsapp_connection_update', handleWSConnectionUpdate)
  wsStore.on('whatsapp_qrcode_updated', handleWSQRCodeUpdate)

  // Carrega status inicial
  await loadStatus()

  // Se nao esta conectado, ja inicia processo de conexao
  if (!isConnected.value) {
    await handleConnect()
  } else {
    loading.value = false
  }
})

onUnmounted(() => {
  // Remove handlers
  wsStore.off('whatsapp_connection_update', handleWSConnectionUpdate)
  wsStore.off('whatsapp_qrcode_updated', handleWSQRCodeUpdate)

  stopPolling()
})
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto py-8 px-4">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <button
          @click="router.push('/settings')"
          class="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Conectar WhatsApp</h1>
          <p class="text-gray-500">Integre seu WhatsApp Business ao CRM</p>
        </div>
      </div>

      <!-- Card Principal -->
      <BaseCard>
        <div class="p-6">
          <!-- Loading Inicial -->
          <div v-if="loading" class="flex flex-col items-center py-12">
            <Loader2 class="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p class="text-gray-500">Carregando...</p>
          </div>

          <!-- Conectado -->
          <div v-else-if="isConnected" class="text-center py-8">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle class="w-10 h-10 text-green-600" />
            </div>

            <h2 class="text-2xl font-bold text-gray-900 mb-2">
              WhatsApp Conectado!
            </h2>
            <p class="text-gray-500 mb-8">
              Suas mensagens estao sendo sincronizadas em tempo real.
            </p>

            <!-- Status -->
            <div class="flex justify-center mb-8">
              <ConnectionStatus
                :state="status?.state || 'open'"
                :phone-number="status?.phone_number"
              />
            </div>

            <!-- Acoes -->
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <BaseButton @click="goToConversations">
                <MessageSquare class="w-4 h-4 mr-2" />
                Ir para Conversas
              </BaseButton>

              <BaseButton
                variant="outline"
                @click="handleDisconnect"
                :loading="actionLoading"
              >
                <LogOut class="w-4 h-4 mr-2" />
                Desconectar
              </BaseButton>
            </div>
          </div>

          <!-- QR Code -->
          <div v-else class="flex flex-col items-center py-4">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">
              Escaneie o QR Code
            </h2>

            <QRCodeDisplay
              :base64="qrCode?.base64"
              :pairing-code="qrCode?.pairingCode"
              :loading="actionLoading"
              :expired="qrExpired"
              @refresh="handleRefreshQR"
            />

            <!-- Botao Atualizar -->
            <button
              v-if="qrCode?.base64 && !qrExpired"
              @click="handleRefreshQR"
              :disabled="actionLoading"
              class="mt-6 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition disabled:opacity-50"
            >
              <RefreshCw :class="['w-4 h-4', { 'animate-spin': actionLoading }]" />
              Gerar novo codigo
            </button>

            <!-- Indicador de WebSocket -->
            <div class="mt-8 flex items-center gap-2 text-sm">
              <component
                :is="wsStore.isConnected ? Wifi : WifiOff"
                :class="['w-4 h-4', wsStore.isConnected ? 'text-green-500' : 'text-red-500']"
              />
              <span :class="wsStore.isConnected ? 'text-green-600' : 'text-red-600'">
                {{ wsStore.isConnected ? 'Tempo real ativo' : 'Reconectando...' }}
              </span>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Info Card -->
      <BaseCard class="mt-6">
        <div class="p-6">
          <h3 class="font-semibold text-gray-900 mb-3">Importante</h3>
          <ul class="space-y-2 text-sm text-gray-600">
            <li>- Mantenha seu celular conectado a internet</li>
            <li>- O WhatsApp Web deve permanecer ativo no celular</li>
            <li>- Mensagens novas aparecerao automaticamente no CRM</li>
            <li>- Voce pode conectar apenas um numero por conta</li>
          </ul>
        </div>
      </BaseCard>
    </div>
  </AppLayout>
</template>