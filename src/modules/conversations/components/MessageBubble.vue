<script setup lang="ts">
import { computed } from 'vue'
import type { Message } from '@/types'
import { MessageDirection, MessageStatus, MessageType } from '@/types'
import { useUsersStore } from '@/stores/users'
import { Check, CheckCheck, Bot, User, FileText, MapPin, Download } from 'lucide-vue-next'

const props = defineProps<{ message: Message }>()

const usersStore = useUsersStore()

const isOutbound = props.message.direction === MessageDirection.OUTBOUND

// Nome de quem enviou
const senderName = computed(() => {
  if (!isOutbound) return null
  if (props.message.sent_by_bot) return 'Bot (Laura)'
  if (props.message.sent_by_id) {
    return usersStore.getUserName(props.message.sent_by_id)
  }
  return null
})

// Verifica tipo de mídia
const isImage = computed(() => props.message.message_type === MessageType.IMAGE || props.message.message_type === 'image')
const isAudio = computed(() => props.message.message_type === MessageType.AUDIO || props.message.message_type === 'audio')
const isVideo = computed(() => props.message.message_type === MessageType.VIDEO || props.message.message_type === 'video')
const isDocument = computed(() => props.message.message_type === MessageType.DOCUMENT || props.message.message_type === 'document')
const isLocation = computed(() => props.message.message_type === 'location')
const isMedia = computed(() => isImage.value || isAudio.value || isVideo.value || isDocument.value)

// URL da mídia (trata base64 e URL direta)
const mediaSource = computed(() => {
  const url = props.message.media_url
  if (!url) return null

  // Já é base64 com prefixo data:
  if (url.startsWith('data:')) return url

  // É base64 sem prefixo (string longa sem http)
  if (url.length > 100 && !url.startsWith('http')) {
    const mimeType = props.message.media_mime_type || 'application/octet-stream'
    return `data:${mimeType};base64,${url}`
  }

  // URL direta
  return url
})

// Verifica se tem texto real (não placeholder)
const hasTextContent = computed(() => {
  if (!props.message.content) return false
  if (/^\[(image|audio|video|document|sticker)\]$/i.test(props.message.content)) return false
  return true
})

// Abre imagem em nova aba
function openImage() {
  if (mediaSource.value) {
    window.open(mediaSource.value, '_blank')
  }
}
</script>

<template>
  <div :class="['flex', isOutbound ? 'justify-end' : 'justify-start']">
    <div :class="[
      'max-w-[70%] rounded-2xl overflow-hidden',
      isOutbound ? 'bg-primary-600 text-white rounded-br-md' : 'bg-white text-gray-900 rounded-bl-md shadow-sm',
      isMedia && mediaSource ? 'p-1' : 'px-4 py-2'
    ]">

      <!-- Nome de quem enviou -->
      <div v-if="senderName" :class="['flex items-center gap-1 mb-1 text-xs opacity-75', isMedia && mediaSource ? 'px-3 pt-2' : '']">
        <Bot v-if="message.sent_by_bot" class="w-3 h-3" />
        <User v-else class="w-3 h-3" />
        <span>{{ senderName }}</span>
      </div>

      <!-- IMAGEM -->
      <template v-if="isImage && mediaSource">
        <img
          :src="mediaSource"
          alt="Imagem"
          class="max-w-full rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
          style="max-height: 300px; object-fit: contain;"
          @click="openImage"
        />
        <p v-if="hasTextContent" class="px-3 py-2 whitespace-pre-wrap break-words">
          {{ message.content }}
        </p>
      </template>

      <!-- ÁUDIO -->
      <template v-else-if="isAudio && mediaSource">
        <div class="p-3">
          <audio controls :src="mediaSource" class="w-full max-w-[250px]">
            Seu navegador não suporta áudio.
          </audio>
        </div>
      </template>

      <!-- VÍDEO -->
      <template v-else-if="isVideo && mediaSource">
        <video
          controls
          :src="mediaSource"
          class="max-w-full rounded-xl"
          style="max-height: 300px;"
        >
          Seu navegador não suporta vídeo.
        </video>
        <p v-if="hasTextContent" class="px-3 py-2 whitespace-pre-wrap break-words">
          {{ message.content }}
        </p>
      </template>

      <!-- DOCUMENTO -->
      <template v-else-if="isDocument">
        <div class="flex items-center gap-3 p-3">
          <FileText class="w-8 h-8 flex-shrink-0" :class="isOutbound ? 'text-white/80' : 'text-gray-500'" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ message.content || 'Documento' }}</p>
            <p class="text-xs opacity-70">{{ message.media_mime_type || 'Arquivo' }}</p>
          </div>
          <a v-if="mediaSource" :href="mediaSource" download class="p-2 rounded-full hover:bg-black/10">
            <Download class="w-5 h-5" />
          </a>
        </div>
      </template>

      <!-- LOCALIZAÇÃO -->
      <template v-else-if="isLocation">
        <div class="flex items-center gap-2 p-3">
          <MapPin class="w-5 h-5" :class="isOutbound ? 'text-white/80' : 'text-red-500'" />
          <span class="text-sm">{{ message.content }}</span>
        </div>
      </template>

      <!-- TEXTO / FALLBACK -->
      <template v-else>
        <p class="whitespace-pre-wrap break-words">{{ message.content }}</p>
      </template>

      <!-- Horário e status -->
      <div :class="[
        'flex items-center gap-1 text-xs',
        isOutbound ? 'justify-end opacity-75' : 'text-gray-500',
        isMedia && mediaSource ? 'px-3 pb-2' : 'mt-1'
      ]">
        <span>{{ new Date(message.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }}</span>
        <CheckCheck v-if="isOutbound && message.status === MessageStatus.READ" class="w-4 h-4 text-blue-300" />
        <Check v-else-if="isOutbound" class="w-4 h-4" />
      </div>
    </div>
  </div>
</template>