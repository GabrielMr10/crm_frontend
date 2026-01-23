<script setup lang="ts">
import { computed } from 'vue'
import { RefreshCw, Loader2, Smartphone } from 'lucide-vue-next'

const props = defineProps<{
  base64?: string
  pairingCode?: string
  loading?: boolean
  expired?: boolean
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const hasQRCode = computed(() => !!props.base64)
</script>

<template>
  <div class="flex flex-col items-center">
    <!-- Loading -->
    <div v-if="loading" class="w-64 h-64 flex items-center justify-center bg-gray-50 rounded-lg">
      <Loader2 class="w-12 h-12 text-blue-600 animate-spin" />
    </div>

    <!-- QR Code -->
    <div v-else-if="hasQRCode && !expired" class="space-y-4">
      <div class="p-4 bg-white rounded-lg shadow-sm border">
        <img
          :src="base64"
          alt="QR Code WhatsApp"
          class="w-64 h-64 object-contain"
        />
      </div>

      <!-- Pairing Code (alternativa) -->
      <div v-if="pairingCode" class="text-center">
        <p class="text-sm text-gray-500 mb-1">Ou use o codigo:</p>
        <p class="text-2xl font-mono font-bold tracking-widest text-gray-900">
          {{ pairingCode }}
        </p>
      </div>
    </div>

    <!-- Expirado -->
    <div v-else-if="expired" class="w-64 h-64 flex flex-col items-center justify-center bg-gray-50 rounded-lg">
      <p class="text-gray-500 mb-4">QR Code expirado</p>
      <button
        @click="emit('refresh')"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        <RefreshCw class="w-4 h-4" />
        Gerar novo codigo
      </button>
    </div>

    <!-- Sem QR Code -->
    <div v-else class="w-64 h-64 flex flex-col items-center justify-center bg-gray-50 rounded-lg">
      <Smartphone class="w-12 h-12 text-gray-400 mb-2" />
      <p class="text-gray-500">Clique para gerar QR Code</p>
    </div>

    <!-- Instrucoes -->
    <div class="mt-6 text-center max-w-sm">
      <p class="text-sm text-gray-600">
        <strong>1.</strong> Abra o WhatsApp no celular
      </p>
      <p class="text-sm text-gray-600 mt-1">
        <strong>2.</strong> Toque em <span class="font-medium">Menu</span> ou <span class="font-medium">Configuracoes</span>
      </p>
      <p class="text-sm text-gray-600 mt-1">
        <strong>3.</strong> Toque em <span class="font-medium">Aparelhos conectados</span>
      </p>
      <p class="text-sm text-gray-600 mt-1">
        <strong>4.</strong> Toque em <span class="font-medium">Conectar um aparelho</span>
      </p>
      <p class="text-sm text-gray-600 mt-1">
        <strong>5.</strong> Aponte o celular para esta tela
      </p>
    </div>
  </div>
</template>