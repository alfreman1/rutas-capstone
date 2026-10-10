<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <Button icon="pi pi-arrow-left" text rounded @click="$router.push('/rutas')" />
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Detalle de Ruta: {{ rutaId }}</h1>
        <p class="text-slate-500 text-sm mt-1">Información de recorrido y entregas</p>
      </div>
    </div>

    <!-- Contenido Principal -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Columna Izquierda: Puntos de Entrega -->
      <div class="lg:col-span-1 space-y-6">
        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <h2 class="text-lg font-semibold text-slate-800 mb-4">Secuencia de Entregas</h2>
          
          <div class="relative border-l-2 border-slate-200 ml-3 space-y-6">
            <!-- Mock timeline items -->
            <div class="relative pl-6">
              <span class="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></span>
              <h3 class="font-medium text-slate-800 text-sm">Almacén Central (Salida)</h3>
              <p class="text-xs text-slate-500 mt-1"><i class="pi pi-clock mr-1"></i> 08:00 AM</p>
            </div>
            
            <div class="relative pl-6">
              <span class="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-300 border-2 border-white"></span>
              <h3 class="font-medium text-slate-800 text-sm">Cliente A (Punto 1)</h3>
              <p class="text-xs text-slate-500 mt-1"><i class="pi pi-clock mr-1"></i> Est: 08:45 AM</p>
              <p class="text-xs text-slate-500"><i class="pi pi-box mr-1"></i> 25 Cajas - 50kg</p>
            </div>

            <div class="relative pl-6">
              <span class="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-300 border-2 border-white"></span>
              <h3 class="font-medium text-slate-800 text-sm">Cliente B (Punto 2)</h3>
              <p class="text-xs text-slate-500 mt-1"><i class="pi pi-clock mr-1"></i> Est: 09:30 AM</p>
            </div>
            
            <div class="relative pl-6">
              <span class="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-800 border-2 border-white"></span>
              <h3 class="font-medium text-slate-800 text-sm">Almacén Central (Retorno)</h3>
              <p class="text-xs text-slate-500 mt-1"><i class="pi pi-clock mr-1"></i> Est: 11:00 AM</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna Derecha: Mapa y Métricas -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Tarjetas de métricas -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
              <i class="pi pi-map-marker"></i>
            </div>
            <div>
              <p class="text-xs text-slate-500 font-medium uppercase">Distancia Total</p>
              <p class="text-xl font-bold text-slate-800">45.5 km</p>
            </div>
          </div>
          
          <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-xl">
              <i class="pi pi-clock"></i>
            </div>
            <div>
              <p class="text-xs text-slate-500 font-medium uppercase">Tiempo Estimado</p>
              <p class="text-xl font-bold text-slate-800">2h 15m</p>
            </div>
          </div>
          
          <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
              <i class="pi pi-box"></i>
            </div>
            <div>
              <p class="text-xs text-slate-500 font-medium uppercase">Carga Total</p>
              <p class="text-xl font-bold text-slate-800">850 kg</p>
            </div>
          </div>
        </div>

        <!-- Mapa Placeholder -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-5 h-[400px] flex flex-col">
          <h2 class="text-lg font-semibold text-slate-800 mb-4">Recorrido Geográfico</h2>
          <div class="flex-1 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400">
            <div class="text-center">
              <i class="pi pi-map text-4xl mb-2"></i>
              <p>Simulación de Mapa de Ruta</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Button from 'primevue/button';

const route = useRoute();
const rutaId = computed(() => route.params.id as string);
</script>
