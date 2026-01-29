<script setup lang="ts">
import { ref, watch, nextTick, computed, onMounted, onUnmounted } from 'vue'
import type { Conversation, Message } from '@/types'
import MessageBubble from './MessageBubble.vue'
import { formatPhone } from '@/shared/utils/formatters'
import { Send, Bot, BotOff, Phone, Loader2, Smile } from 'lucide-vue-next'
import data from '@emoji-mart/data'
import { Picker } from 'emoji-mart'

const props = defineProps<{
  conversation: Conversation | null
  messages: Message[]
  loading?: boolean
  sendingMessage?: boolean
}>()

const emit = defineEmits<{
  (e: 'send', content: string): void
  (e: 'toggle-bot'): void
}>()

const messageInput = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const emojiPickerRef = ref<HTMLDivElement | null>(null)
const canSend = computed(() => messageInput.value.trim().length > 0)

// === EMOJI PICKER ===
const showEmojiPicker = ref(false)
let pickerInstance: any = null

function initEmojiPicker() {
  if (emojiPickerRef.value && !pickerInstance) {
    pickerInstance = new Picker({
      data,
      onEmojiSelect: (emoji: any) => {
        insertEmoji(emoji.native)
      },
      locale: 'pt',
      theme: 'light',
      previewPosition: 'none',
      skinTonePosition: 'search',
      maxFrequentRows: 2,
      perLine: 8
    })
    emojiPickerRef.value.appendChild(pickerInstance)
  }
}

function destroyEmojiPicker() {
  if (pickerInstance && emojiPickerRef.value) {
    emojiPickerRef.value.innerHTML = ''
    pickerInstance = null
  }
}

watch(showEmojiPicker, (show) => {
  if (show) {
    nextTick(() => initEmojiPicker())
  } else {
    destroyEmojiPicker()
  }
})

function insertEmoji(emoji: string) {
  if (textareaRef.value) {
    const start = textareaRef.value.selectionStart
    const end = textareaRef.value.selectionEnd
    const text = messageInput.value
    messageInput.value = text.substring(0, start) + emoji + text.substring(end)

    nextTick(() => {
      if (textareaRef.value) {
        const newPos = start + emoji.length
        textareaRef.value.selectionStart = newPos
        textareaRef.value.selectionEnd = newPos
        textareaRef.value.focus()
      }
    })
  } else {
    messageInput.value += emoji
  }
}

function toggleEmojiPicker() {
  showEmojiPicker.value = !showEmojiPicker.value
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.emoji-picker-container')) {
    showEmojiPicker.value = false
  }
}

// === MENSAGENS ===
function sendMessage() {
  if (!canSend.value || props.sendingMessage) return
  emit('send', messageInput.value.trim())
  messageInput.value = ''
  showEmojiPicker.value = false
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

watch(() => props.messages, scrollToBottom, { deep: true })
watch(() => props.conversation?.id, scrollToBottom)

onUnmounted(() => {
  destroyEmojiPicker()
})
</script>

<template>
  <div class="h-full flex flex-col bg-gray-50" @click="handleClickOutside">
    <div v-if="!conversation" class="flex-1 flex items-center justify-center text-gray-500">
      <div class="text-center">
        <Phone class="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p>Selecione uma conversa</p>
      </div>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="bg-white border-b p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium overflow-hidden">
          <img
            v-if="conversation.contact_avatar_url"
            :src="conversation.contact_avatar_url"
            :alt="conversation.contact_name || conversation.phone"
            class="w-full h-full object-cover"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          />
          <span v-else>{{ (conversation.contact_name ?? '?').charAt(0).toUpperCase() }}</span>
        </div>
        <div class="flex-1">
          <h3 class="font-semibold">{{ conversation.contact_name || formatPhone(conversation.phone) }}</h3>
          <p class="text-sm text-gray-500">{{ formatPhone(conversation.phone) }}</p>
        </div>
        <button @click="emit('toggle-bot')"
          :class="['p-2 rounded-lg transition-colors', conversation.is_bot_active ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
          :title="conversation.is_bot_active ? 'Bot ativo - Clique para desativar' : 'Bot inativo - Clique para ativar'">
          <Bot v-if="conversation.is_bot_active" class="w-5 h-5" />
          <BotOff v-else class="w-5 h-5" />
        </button>
      </div>

      <!-- Messages -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3">
        <div v-if="loading" class="flex justify-center py-4">
          <Loader2 class="w-6 h-6 text-primary-600 animate-spin" />
        </div>
        <div v-else-if="!messages.length" class="text-center text-gray-500 py-8">
          Nenhuma mensagem ainda
        </div>
        <MessageBubble v-else v-for="msg in messages" :key="msg.id" :message="msg" />
      </div>

      <!-- Input Area -->
      <div class="bg-white border-t p-4">
        <div class="flex items-end gap-2">

          <!-- Emoji Button + Picker -->
          <div class="relative emoji-picker-container">
            <button
              @click.stop="toggleEmojiPicker"
              class="p-3 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
              title="Emojis"
            >
              <Smile class="w-5 h-5" />
            </button>

            <!-- Emoji Picker Popup -->
            <Transition name="fade-up">
              <div
                v-if="showEmojiPicker"
                ref="emojiPickerRef"
                class="absolute bottom-14 left-0 z-50"
                @click.stop
              />
            </Transition>
          </div>

          <!-- Text Input -->
          <textarea
            ref="textareaRef"
            v-model="messageInput"
            @keydown.enter.exact.prevent="sendMessage"
            placeholder="Digite sua mensagem..."
            rows="1"
            class="flex-1 px-4 py-3 bg-gray-100 rounded-2xl resize-none max-h-32 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors"
          />

          <!-- Send Button -->
          <button
            @click="sendMessage"
            :disabled="!canSend || sendingMessage"
            :class="[
              'p-3 rounded-full transition-colors',
              canSend && !sendingMessage
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-200 text-gray-400'
            ]"
          >
            <Loader2 v-if="sendingMessage" class="w-5 h-5 animate-spin" />
            <Send v-else class="w-5 h-5" />
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.2s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
