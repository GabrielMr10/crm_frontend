<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex">
    <!-- Branding -->
    <div class="hidden lg:flex lg:w-1/2 flex-col justify-center items-center text-white p-12">
      <div class="max-w-md text-center">
        <h1 class="text-4xl font-bold mb-4">CRM WhatsApp</h1>
        <p class="text-xl text-primary-100">Gerencie leads e automatize vendas com IA</p>
        <div class="mt-12 space-y-4 text-left">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">🤖</div>
            <div><h3 class="font-semibold">IA Integrada</h3><p class="text-sm text-primary-100">Laura, assistente 24h</p></div>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">📱</div>
            <div><h3 class="font-semibold">WhatsApp Business</h3><p class="text-sm text-primary-100">Atendimento automatizado</p></div>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">📊</div>
            <div><h3 class="font-semibold">Pipeline Visual</h3><p class="text-sm text-primary-100">Kanban para vendas</p></div>
          </div>
        </div>
      </div>
    </div>
    <!-- Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8">
      <div class="w-full max-w-md"><slot /></div>
    </div>
  </div>
</template>
