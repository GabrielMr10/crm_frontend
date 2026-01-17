<script setup lang="ts">
import type { Lead } from '@/types'
import LeadStatusBadge from './LeadStatusBadge.vue'
import { formatPhone, formatRelativeTime } from '@/shared/utils/formatters'
import { Phone, Mail, Building2, Clock } from 'lucide-vue-next'

defineProps<{ lead: Lead }>()
const emit = defineEmits<{ (e: 'click', id: string): void }>()
</script>

<template>
  <div @click="emit('click', lead.id)"
    class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-primary-300 transition-all cursor-pointer">
    <div class="flex items-start justify-between mb-3">
      <div>
        <h3 class="font-semibold text-gray-900">{{ lead.name }}</h3>
        <p v-if="lead.company_name" class="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
          <Building2 class="w-3 h-3" />{{ lead.company_name }}
        </p>
      </div>
      <LeadStatusBadge :status="lead.status" />
    </div>

    <div class="space-y-1.5 text-sm text-gray-600">
      <div class="flex items-center gap-2">
        <Phone class="w-4 h-4 text-gray-400" />
        <span>{{ formatPhone(lead.phone) }}</span>
      </div>
      <div v-if="lead.email" class="flex items-center gap-2">
        <Mail class="w-4 h-4 text-gray-400" />
        <span class="truncate">{{ lead.email }}</span>
      </div>
    </div>

    <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
      <div class="flex items-center gap-1 text-xs text-gray-400">
        <Clock class="w-3 h-3" />
        <span>{{ formatRelativeTime(lead.created_at) }}</span>
      </div>
      <div v-if="lead.score > 0" class="flex items-center gap-1">
        <span class="text-xs text-gray-500">Score:</span>
        <span :class="['text-xs font-medium', lead.score >= 70 ? 'text-green-600' : lead.score >= 40 ? 'text-yellow-600' : 'text-gray-600']">
          {{ lead.score }}
        </span>
      </div>
    </div>
  </div>
</template>
