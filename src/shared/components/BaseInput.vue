<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: string | number
  type?: string
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
}>(), { type: 'text', disabled: false, required: false })

const emit = defineEmits<{ (e: 'update:modelValue', value: string | number): void }>()
const inputValue = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
</script>

<template>
  <div>
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}<span v-if="required" class="text-red-500">*</span>
    </label>
    <input v-model="inputValue" :type="type" :placeholder="placeholder" :disabled="disabled" :required="required"
      :class="['block w-full rounded-lg border px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-primary-500 sm:text-sm',
        error ? 'border-red-300' : 'border-gray-300']" />
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>
