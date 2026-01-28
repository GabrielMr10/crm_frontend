<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue'
import type { Message } from '@/types'
import { MessageDirection, MessageStatus, MessageType } from '@/types'
import { useUsersStore } from '@/stores/users'
import { Check, CheckCheck, Bot, User, FileText, MapPin, Download, X, Play, Video } from 'lucide-vue-next'

const props = defineProps<{ message: Message }>()

const usersStore = useUsersStore()

const isOutbound = props.message.direction === MessageDirection.OUTBOUND

// Estado do visualizador de mídia
const isViewerOpen = ref(false)
const videoDuration = ref('0:00')
const videoRef = ref<HTMLVideoElement | null>(null)

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
const messageType = computed(() => props.message.message_type?.toLowerCase() || '')
const isImage = computed(() => messageType.value === 'image' || messageType.value === MessageType.IMAGE)
const isAudio = computed(() => ['audio', 'voice', 'ptt'].includes(messageType.value) || messageType.value === MessageType.AUDIO)
const isVideo = computed(() => messageType.value === 'video' || messageType.value === MessageType.VIDEO)
const isDocument = computed(() => ['document', 'application'].includes(messageType.value) || messageType.value === MessageType.DOCUMENT)
const isLocation = computed(() => messageType.value === 'location')
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

// Horário formatado
const formattedTime = computed(() => {
  return new Date(props.message.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
})

// Formata segundos em MM:SS
function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds === 0) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Captura metadados do vídeo quando carrega
function handleVideoMetadata() {
  if (videoRef.value) {
    videoDuration.value = formatDuration(videoRef.value.duration)
  }
}

// --- AÇÕES DO VISUALIZADOR ---
function openViewer() {
  if (!mediaSource.value) return
  isViewerOpen.value = true
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', handleKeydown)
}

function closeViewer() {
  isViewerOpen.value = false
  document.body.style.overflow = ''
  window.removeEventListener('keydown', handleKeydown)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeViewer()
}

async function downloadMedia() {
  if (!mediaSource.value) return

  try {
    // Para base64, cria link direto
    if (mediaSource.value.startsWith('data:')) {
      const a = document.createElement('a')
      a.href = mediaSource.value
      const ext = isImage.value ? 'jpg' : isVideo.value ? 'mp4' : 'file'
      a.download = `media-${Date.now()}.${ext}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      return
    }

    // Para URLs, faz fetch e força download
    const response = await fetch(mediaSource.value)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const fileName = mediaSource.value.split('/').pop() || `media-${Date.now()}`
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Erro ao baixar mídia:', error)
    window.open(mediaSource.value, '_blank')
  }
}

// Cleanup ao desmontar
onUnmounted(() => {
  if (isViewerOpen.value) {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', handleKeydown)
  }
})
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
        <div class="relative cursor-pointer group/img" @click="openViewer">
          <img
            :src="mediaSource"
            alt="Imagem"
            class="max-w-full rounded-xl transition-all duration-200 group-hover/img:brightness-90"
            style="max-height: 300px; object-fit: contain;"
          />
          <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
            <div class="bg-black/50 rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
        </div>
        <p v-if="hasTextContent" class="px-3 py-2 whitespace-pre-wrap wrap-break-word">
          {{ message.content }}
        </p>
      </template>

      <!-- ÁUDIO -->
      <template v-else-if="isAudio && mediaSource">
        <div class="p-0 min-w-90">
          <audio controls preload="metadata" class="w-full h-15">
            <source :src="mediaSource" type="audio/ogg">
            <source :src="mediaSource" type="audio/mpeg">
            <source :src="mediaSource" type="audio/mp4">
            <source :src="mediaSource" type="audio/webm">
            Seu navegador não suporta áudio.
          </audio>
        </div>
      </template>

      <!-- VÍDEO -->
      <template v-else-if="isVideo && mediaSource">
        <div
          class="relative cursor-pointer group/video rounded-xl overflow-hidden"
          @click="openViewer"
        >
          <!-- Thumbnail do vídeo (sem controles) -->
          <video
            ref="videoRef"
            :src="mediaSource + '#t=0.1'"
            preload="metadata"
            class="max-w-full rounded-xl brightness-90"
            style="max-height: 300px; object-fit: cover;"
            @loadedmetadata="handleVideoMetadata"
          />

          <!-- Overlay escuro -->
          <div class="absolute inset-0 bg-black/20 group-hover/video:bg-black/40 transition-colors" />

          <!-- Botão de Play central -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="bg-black/50 rounded-full p-4 backdrop-blur-sm group-hover/video:bg-black/70 group-hover/video:scale-110 transition-all shadow-lg">
              <Play class="w-8 h-8 text-white fill-white" />
            </div>
          </div>

          <!-- Duração no canto inferior esquerdo -->
          <div class="absolute bottom-2 left-2 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded-md backdrop-blur-sm flex items-center gap-1">
            <Video class="w-3 h-3 opacity-80" />
            <span>{{ videoDuration }}</span>
          </div>
        </div>
        <p v-if="hasTextContent" class="px-3 py-2 whitespace-pre-wrap wrap-break-word">
          {{ message.content }}
        </p>
      </template>

      <!-- DOCUMENTO -->
      <template v-else-if="isDocument">
        <div class="flex items-center gap-3 p-3">
          <FileText class="w-8 h-8 shrink-0" :class="isOutbound ? 'text-white/80' : 'text-gray-500'" />
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
        <p class="whitespace-pre-wrap wrap-break-word">{{ message.content }}</p>
      </template>

      <!-- Horário e status -->
      <div :class="[
        'flex items-center gap-1 text-xs',
        isOutbound ? 'justify-end opacity-75' : 'text-gray-500',
        isMedia && mediaSource ? 'px-3 pb-2' : 'mt-1'
      ]">
        <span>{{ formattedTime }}</span>
        <CheckCheck v-if="isOutbound && message.status === MessageStatus.READ" class="w-4 h-4 text-blue-300" />
        <Check v-else-if="isOutbound" class="w-4 h-4" />
      </div>
    </div>

    <!-- LIGHTBOX / VISUALIZADOR DE MÍDIA -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="isViewerOpen"
          class="fixed inset-0 z-[9999] bg-black/95 flex flex-col"
          @click.self="closeViewer"
        >
          <!-- Header -->
          <div class="flex justify-between items-center p-4 text-white bg-gradient-to-b from-black/60 to-transparent">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium">
                {{ isOutbound ? 'Eu' : '?' }}
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-medium">{{ isOutbound ? 'Você' : 'Cliente' }}</span>
                <span class="text-xs text-white/70">{{ formattedTime }}</span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                @click.stop="downloadMedia"
                class="p-3 hover:bg-white/10 rounded-full transition-colors"
                title="Baixar mídia"
              >
                <Download class="w-6 h-6" />
              </button>

              <button
                @click.stop="closeViewer"
                class="p-3 hover:bg-white/10 rounded-full transition-colors"
                title="Fechar (ESC)"
              >
                <X class="w-6 h-6" />
              </button>
            </div>
          </div>

          <!-- Conteúdo (Imagem ou Vídeo) -->
          <div class="flex-1 flex items-center justify-center p-4 overflow-auto">
            <!-- Imagem -->
            <img
              v-if="isImage"
              :src="mediaSource!"
              class="max-w-full max-h-full object-contain animate-zoom-in select-none"
              @click.stop
            />

            <!-- Vídeo com controles e autoplay -->
            <video
              v-else-if="isVideo"
              :src="mediaSource!"
              controls
              autoplay
              class="max-w-full max-h-full animate-zoom-in outline-none rounded-lg"
              @click.stop
            >
              Seu navegador não suporta vídeo.
            </video>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Animações do Lightbox */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate-zoom-in {
  animation: zoomIn 0.25s ease-out;
}

@keyframes zoomIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>