<script setup lang="ts">
import { computed } from 'vue'
import { LeadStatus } from '@/types'
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from '@/shared/utils/constants'

const props = defineProps<{ status: LeadStatus | string }>()

const label = computed(() => LEAD_STATUS_LABELS[props.status as LeadStatus] || props.status)
const colorClass = computed(() => LEAD_STATUS_COLORS[props.status as LeadStatus] || 'bg-gray-100 text-gray-800')
</script>

<template>
  <span :class="['px-2.5 py-1 text-xs font-medium rounded-full', colorClass]">
    {{ label }}
  </span>
</template>
