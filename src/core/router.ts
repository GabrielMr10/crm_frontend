import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  // Auth (publicas)
  { path: '/login', name: 'login', component: () => import('@/modules/auth/views/LoginView.vue'), meta: { requiresAuth: false } },
  { path: '/register', name: 'register', component: () => import('@/modules/auth/views/RegisterView.vue'), meta: { requiresAuth: false } },

  // App (protegidas)
  { path: '/', name: 'dashboard', component: () => import('@/modules/dashboard/views/DashboardView.vue'), meta: { requiresAuth: true } },
  { path: '/leads', name: 'leads', component: () => import('@/modules/leads/views/LeadsListView.vue'), meta: { requiresAuth: true } },
  { path: '/leads/:id', name: 'lead-detail', component: () => import('@/modules/leads/views/LeadDetailView.vue'), meta: { requiresAuth: true } },
  { path: '/pipeline', name: 'pipeline', component: () => import('@/modules/pipeline/views/PipelineView.vue'), meta: { requiresAuth: true } },
  { path: '/conversations', name: 'conversations', component: () => import('@/modules/conversations/views/ConversationsView.vue'), meta: { requiresAuth: true } },
  { path: '/ai-agent', name: 'ai-agent', component: () => import('@/modules/ai-agent/views/AgentConfigView.vue'), meta: { requiresAuth: true } },
  { path: '/users', name: 'users', component: () => import('@/modules/users/views/UsersListView.vue'), meta: { requiresAuth: true } },
  { path: '/settings', name: 'settings', component: () => import('@/modules/settings/views/SettingsView.vue'), meta: { requiresAuth: true } },
  { path: '/settings/profile', name: 'profile', component: () => import('@/modules/settings/views/ProfileView.vue'), meta: { requiresAuth: true } },

  // Catch all
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de autenticacao
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (!requiresAuth && authStore.isAuthenticated && ['login', 'register'].includes(to.name as string)) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
