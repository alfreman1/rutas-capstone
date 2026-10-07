<template>
  <div class="flex h-screen bg-slate-100">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
      <div class="h-16 flex items-center px-6 font-bold text-xl border-b border-slate-800">
        LogiRoute
      </div>
      <nav class="flex-1 overflow-y-auto py-4">
        <!-- Dashboard -->
        <router-link to="/dashboard" class="flex items-center px-6 py-3 text-slate-300 hover:bg-slate-800 hover:text-white" active-class="bg-blue-600 text-white hover:bg-blue-600">
          <i class="pi pi-home mr-3"></i> Dashboard
        </router-link>
        
        <div class="px-6 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4">Gestión</div>
        <router-link to="/contratos" class="flex items-center px-6 py-2 text-slate-300 hover:bg-slate-800 hover:text-white" active-class="text-blue-400">Contratos</router-link>
        <router-link to="/puntos-entrega" class="flex items-center px-6 py-2 text-slate-300 hover:bg-slate-800 hover:text-white" active-class="text-blue-400">Puntos de Entrega</router-link>
        
        <div class="px-6 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4">Planificación</div>
        <router-link to="/jornadas" class="flex items-center px-6 py-2 text-slate-300 hover:bg-slate-800 hover:text-white" active-class="text-blue-400">Jornadas</router-link>
        <router-link to="/planificaciones" class="flex items-center px-6 py-2 text-slate-300 hover:bg-slate-800 hover:text-white" active-class="text-blue-400">Planificaciones</router-link>

        <div class="px-6 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4">Operación</div>
        <router-link to="/rutas" class="flex items-center px-6 py-2 text-slate-300 hover:bg-slate-800 hover:text-white" active-class="text-blue-400">Rutas</router-link>
      </nav>
      <div class="p-4 border-t border-slate-800">
        <button @click="logout" class="w-full flex items-center px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded">
          <i class="pi pi-sign-out mr-3"></i> Cerrar sesión
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top header -->
      <header class="h-16 bg-white border-b flex items-center justify-between px-6">
        <div class="text-xl font-semibold text-slate-800">Plataforma Logística</div>
        <div class="flex items-center">
          <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            A
          </div>
        </div>
      </header>
      
      <!-- Page content -->
      <main class="flex-1 overflow-y-auto p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const logout = () => {
  // Lógica de logout con Pinia/Auth service iría aquí
  localStorage.removeItem('token');
  router.push('/auth/login');
};
</script>
