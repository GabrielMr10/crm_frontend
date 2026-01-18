import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './core/router'
import { useAuthStore } from './stores/auth'
import './style.css'

async function bootstrap() {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)

  // Inicializa auth store antes de montar a app
  const authStore = useAuthStore()

  // Aguarda inicialização do auth (recupera sessão do localStorage)
  await authStore.initialize()

  // Aguarda router estar pronto
  await router.isReady()

  // Monta a aplicação
  app.mount('#app')
}

bootstrap()