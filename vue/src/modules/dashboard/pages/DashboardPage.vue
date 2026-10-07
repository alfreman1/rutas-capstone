<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-800">Dashboard</h1>
      <div class="text-sm text-slate-500">
        Hoy, {{ new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) }}
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
        <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl mr-4">
          <i class="pi pi-calendar"></i>
        </div>
        <div>
          <div class="text-sm font-medium text-slate-500">Jornadas activas</div>
          <div class="text-2xl font-bold text-slate-800">3</div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
        <div class="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mr-4">
          <i class="pi pi-map-marker"></i>
        </div>
        <div>
          <div class="text-sm font-medium text-slate-500">Puntos de entrega</div>
          <div class="text-2xl font-bold text-slate-800">42</div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
        <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mr-4">
          <i class="pi pi-truck"></i>
        </div>
        <div>
          <div class="text-sm font-medium text-slate-500">Vehículos en operación</div>
          <div class="text-2xl font-bold text-slate-800">3 <span class="text-sm font-normal text-slate-400">/ 5</span></div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
        <div class="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-xl mr-4">
          <i class="pi pi-directions"></i>
        </div>
        <div>
          <div class="text-sm font-medium text-slate-500">Distancia total (hoy)</div>
          <div class="text-2xl font-bold text-slate-800">61.97 <span class="text-sm font-normal text-slate-400">km</span></div>
        </div>
      </div>
    </div>

    <!-- Charts & Map Section Mock -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[400px] flex items-center justify-center text-slate-400">
        [ Componente de Mapa de Rutas Aquí ]
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[400px] flex items-center justify-center text-slate-400">
        [ Gráfico Comparativo Aquí ]
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Dashboard Page logic
</script>
