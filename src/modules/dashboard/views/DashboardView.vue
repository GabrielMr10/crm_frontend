<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/layouts/AppLayout.vue'
import { BaseCard } from '@/shared/components'
import { Users, DollarSign, MessageSquare, TrendingUp } from 'lucide-vue-next'

const authStore = useAuthStore()

const stats = [
  { title: 'Total Leads', value: '0', icon: Users, color: 'bg-blue-500' },
  { title: 'Pipeline', value: 'R$ 0', icon: DollarSign, color: 'bg-green-500' },
  { title: 'Conversas', value: '0', icon: MessageSquare, color: 'bg-purple-500' },
  { title: 'Conversao', value: '0%', icon: TrendingUp, color: 'bg-orange-500' },
]
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Ola, {{ authStore.user?.full_name?.split(' ')[0] }}! 👋</h1>
        <p class="text-gray-500">Bem-vindo ao seu CRM</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <BaseCard v-for="stat in stats" :key="stat.title" :padding="false">
          <div class="p-6 flex items-center gap-4">
            <div :class="[stat.color, 'w-12 h-12 rounded-lg flex items-center justify-center']">
              <component :is="stat.icon" class="w-6 h-6 text-white" />
            </div>
            <div>
              <p class="text-sm text-gray-500">{{ stat.title }}</p>
              <p class="text-2xl font-bold">{{ stat.value }}</p>
            </div>
          </div>
        </BaseCard>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BaseCard title="Leads Recentes">
          <p class="text-gray-500 text-center py-8">Nenhum lead ainda. Crie seu primeiro!</p>
        </BaseCard>

        <BaseCard title="Atividades">
          <p class="text-gray-500 text-center py-8">Nenhuma atividade recente.</p>
        </BaseCard>
      </div>
    </div>
  </AppLayout>
</template>
