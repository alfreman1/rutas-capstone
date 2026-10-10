<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-800">Playground de Optimización (Algoritmo VRP)</h1>
      <Tag value="Modo Demo" severity="warning" rounded />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Configuración -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
        <h2 class="text-lg font-bold text-slate-800 mb-4">Parámetros de Simulación</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Nº Puntos de Entrega (Dataset Sintético)</label>
            <InputNumber v-model="numPoints" class="w-full" :min="1" :max="200" showButtons />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Nº Camiones Disponibles</label>
            <InputNumber v-model="numVehicles" class="w-full" :min="1" :max="50" showButtons />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Semilla Aleatoria (Seed)</label>
            <InputNumber v-model="seed" class="w-full" :min="1" showButtons v-tooltip="'Fija la semilla para generar siempre el mismo dataset aleatorio'" />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Estrategia / Algoritmo</label>
            <Dropdown v-model="algorithm" :options="algorithmOptions" optionLabel="label" optionValue="value" class="w-full" />
          </div>

          <Button 
            label="Generar y Optimizar Rutas" 
            icon="pi pi-bolt" 
            severity="primary" 
            class="w-full mt-4" 
            @click="correrOptimizacion" 
            :loading="isProcessing"
          />
        </div>
      </div>

      <!-- Resultados -->
      <div class="md:col-span-2 space-y-6">
        <div v-if="resultado" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-blue-50 border border-blue-100 p-4 rounded-xl text-center">
            <div class="text-blue-500 text-sm font-semibold mb-1">Distancia Total</div>
            <div class="text-2xl font-bold text-blue-900">{{ resultado.resultado.distanciaTotalKm }} km</div>
          </div>
          <div class="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center">
            <div class="text-emerald-500 text-sm font-semibold mb-1">Algoritmo Usado</div>
            <div class="text-md font-bold text-emerald-900 mt-2">{{ resultado.algoritmo_usado === 'OR_TOOLS' ? 'Línea Base' : 'K-Means + OR-Tools' }}</div>
          </div>
          <div class="bg-purple-50 border border-purple-100 p-4 rounded-xl text-center">
            <div class="text-purple-500 text-sm font-semibold mb-1">Tiempo de Cómputo (IA)</div>
            <div class="text-2xl font-bold text-purple-900">{{ resultado.tiempo_computo_segundos }} s</div>
          </div>
        </div>

        <div v-if="resultado" class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="p-4 border-b border-slate-100 font-semibold flex justify-between items-center bg-slate-50">
            <span>Rutas Asignadas ({{ resultado.resultado.vehiculosUtilizados }} vehículos usados)</span>
            <Tag :value="'Seed: ' + resultado.semilla" severity="info"></Tag>
          </div>
          <div class="divide-y divide-slate-100 overflow-y-auto max-h-[500px]">
            <div v-for="(ruta, index) in resultado.resultado.rutas" :key="index" class="p-4 hover:bg-slate-50 transition-colors">
              <div class="flex justify-between items-start mb-2">
                <span class="font-bold text-slate-800">Ruta {{ index + 1 }} ({{ ruta.vehiculoId }})</span>
                <span class="text-xs font-semibold bg-slate-100 px-2 py-1 rounded text-slate-600">{{ ruta.distanciaKm }} km</span>
              </div>
              <div class="flex items-center text-sm text-slate-500 mb-2">
                <i class="pi pi-map-marker mr-1"></i> {{ ruta.entregas.length }} paradas asignadas
              </div>
              <div class="flex flex-wrap gap-2 mt-2">
                <span v-for="entrega in ruta.entregas" :key="entrega.orden" class="text-xs bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-600">
                  <span class="text-slate-400">#{{ entrega.orden }}</span> {{ entrega.puntoEntregaId }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else-if="!isProcessing" class="bg-white p-12 rounded-xl border border-slate-200 border-dashed text-center text-slate-400">
          <i class="pi pi-map text-4xl mb-3 text-slate-300"></i>
          <p>Configura los parámetros a la izquierda y presiona el botón para simular una optimización CVRP.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';

const numPoints = ref(20);
const numVehicles = ref(3);
const seed = ref(42);
const algorithm = ref('OR_TOOLS');

const algorithmOptions = [
  { label: 'Puro OR-Tools (Línea Base)', value: 'OR_TOOLS' },
  { label: 'K-Means + OR-Tools (Modelo ML)', value: 'KMEANS_ORTOOLS' }
];

const isProcessing = ref(false);
const resultado = ref<any>(null);

const correrOptimizacion = async () => {
  isProcessing.value = true;
  resultado.value = null;
  
  try {
    const res = await fetch('http://localhost:8000/api/v1/optimize/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        num_points: numPoints.value,
        num_vehicles: numVehicles.value,
        seed: seed.value,
        algorithm: algorithm.value
      })
    });
    
    if (res.ok) {
      const payload = await res.json();
      resultado.value = payload.data;
    }
  } catch (error) {
    console.error("Error conectando con FastAPI Demo:", error);
  } finally {
    isProcessing.value = false;
  }
};
</script>
