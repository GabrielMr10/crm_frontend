<script setup lang="ts">
import type { Deal } from '@/types'
import { formatCurrency, formatRelativeTime } from '@/shared/utils/formatters'
import { DollarSign, Calendar, User, GripVertical } from 'lucide-vue-next'

defineProps<{ deal: Deal }>()
const emit = defineEmits<{ (e: 'click', deal: Deal): void }>()
</script>

<template>
  <div @click="emit('click', deal)"
    class="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md hover:border-primary-300 transition-all cursor-pointer group">
    <div class="flex items-start gap-2">
      <GripVertical class="w-4 h-4 text-gray-300 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
      <div class="flex-1 min-w-0">
        <h4 class="font-medium text-gray-900 truncate">{{ deal.title }}</h4>

        <div class="mt-2 space-y-1">
          <div v-if="deal.value > 0" class="flex items-center gap-1 text-sm text-green-600">
            <DollarSign class="w-3 h-3" />
            <span class="font-medium">{{ formatCurrency(deal.value) }}</span>
          </div>

          <div v-if="deal.expected_close_date" class="flex items-center gap-1 text-xs text-gray-500">
            <Calendar class="w-3 h-3" />
            <span>{{ formatRelativeTime(deal.expected_close_date) }}</span>
          </div>
        </div>

        <div class="mt-2 flex items-center justify-between">
          <div v-if="deal.probability > 0"
            class="text-xs px-2 py-0.5 rounded-full"
            :class="deal.probability >= 70 ? 'bg-green-100 text-green-700' : deal.probability >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'">
            {{ deal.probability }}%
          </div>

          <div v-if="deal.assigned_to_id" class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
            <User class="w-3 h-3 text-gray-500" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
