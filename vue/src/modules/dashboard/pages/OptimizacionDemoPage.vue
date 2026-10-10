<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Encabezado Académico -->
    <div class="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-8 text-white shadow-lg">
      <div class="flex items-center justify-between mb-2">
        <p class="text-blue-400 font-semibold tracking-wider text-sm uppercase">Rutas VRP</p>
        <Tag value="Modo Demo" severity="warning" rounded />
      </div>
      <h1 class="text-4xl font-bold mb-4">Evaluación de Modelos de Optimización</h1>
      <p class="text-slate-300 max-w-3xl leading-relaxed">
        Este entorno permite simular escenarios de distribución urbana para evaluar el rendimiento de algoritmos de ruteo vehicular (VRP). 
        Al ser un problema de optimización combinatoria, no se utilizan métricas de Machine Learning clásico (Accuracy, F1), sino que 
        se mide la <strong>reducción de distancia total</strong> y la <strong>eficiencia computacional</strong> al aplicar agrupamiento espacial.
      </p>
    </div>

    <!-- Tabs/Secciones Informativas -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Configuración -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 class="text-lg font-bold text-slate-800 mb-4 border-b pb-2">1. Configurar Escenario</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Nº Puntos de Entrega (Demanda)</label>
            <InputNumber v-model="numPoints" class="w-full" :min="1" :max="200" showButtons />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Nº Vehículos de la Flota</label>
            <InputNumber v-model="numVehicles" class="w-full" :min="1" :max="50" showButtons />
          </div>

          <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <label class="block text-sm font-bold text-slate-700 mb-1">Semilla (Seed) de Generación</label>
           
            <InputNumber v-model="seed" class="w-full" :min="1" showButtons />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Modelo a Evaluar</label>
            <Dropdown v-model="algorithm" :options="algorithmOptions" optionLabel="label" optionValue="value" class="w-full" />
            
          </div>

          <Button 
            label="Ejecutar Modelo" 
            icon="pi pi-play" 
            severity="primary" 
            class="w-full mt-4" 
            @click="correrOptimizacion" 
            :loading="isProcessing"
          />
        </div>
      </div>

      <!-- Resultados -->
      <div class="md:col-span-2 space-y-6">
        <div v-if="resultado" class="space-y-6">
          <h2 class="text-lg font-bold text-slate-800 border-b pb-2">2. Métricas de Evaluación</h2>
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div class="bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm">
              <div class="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wider">Distancia Total</div>
              <div class="text-2xl font-bold text-blue-600">{{ resultado.resultado.metrics?.distanceTotalKm || resultado.resultado.distanciaTotalKm }} <span class="text-sm font-normal">km</span></div>
            </div>
            <div class="bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm">
              <div class="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wider">Tiempo Reparto</div>
              <div class="text-2xl font-bold text-orange-500">{{ resultado.resultado.metrics?.timeTotalMin || resultado.resultado.tiempoTotalMinutos || 0 }} <span class="text-sm font-normal">min</span></div>
            </div>
            <div class="bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm">
              <div class="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wider">Algoritmo</div>
              <div class="text-sm font-bold text-emerald-600 mt-2 leading-tight">
                {{ resultado.algoritmo_usado === 'OR_TOOLS' ? 'Línea Base (Global)' : 'K-Means + VRP' }}
              </div>
            </div>
            <div class="bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm">
              <div class="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wider">Costo Computacional</div>
              <div class="text-2xl font-bold text-purple-600">{{ resultado.tiempo_computo_segundos }} <span class="text-sm font-normal">s</span></div>
            </div>
          </div>

          <!-- Tabs para visualizar datos -->
          <TabView class="mt-4 shadow-sm border border-slate-200 rounded-xl overflow-hidden bg-white">
            <TabPanel header="Mapa Interactivo">
              <!-- MAPA -->
              <div class="bg-white overflow-hidden" v-show="resultado">
                <div class="p-4 border-b border-slate-100 font-semibold bg-slate-50 flex justify-between items-center">
                  <span class="text-slate-700"><i class="pi pi-map mr-2"></i>Trazado de Rutas Generadas</span>
                  <div class="flex items-center gap-2 text-sm">
                    <label for="routeMode" class="font-medium text-slate-600">Modo de Trazado:</label>
                    <Dropdown id="routeMode" v-model="routeMode" :options="routeModeOptions" optionLabel="label" optionValue="value" class="w-40 h-9" />
                  </div>
                </div>
                <div style="height: 500px; width: 100%; z-index: 0;">
                  <BaseMap v-if="resultado" :options="{ center: { lat: -19.03332, lng: -65.26274 }, zoom: 13 }">
                    
                    <!-- Depósito Central -->
                    <MapMarker 
                      :position="{ lat: -19.03332, lng: -65.26274 }" 
                      title="Almacén Central (Depósito)"
                    >
                      <div class="text-center p-1">
                        <h3 class="font-bold text-slate-800 text-sm">Almacén Central</h3>
                        <p class="text-xs text-slate-500">Punto de Partida</p>
                      </div>
                    </MapMarker>

                    <!-- Rutas y Paradas -->
                    <template v-for="(ruta, idx) in resultado.resultado.routes || resultado.resultado.rutas" :key="'r-'+idx">
                      <MapRoute 
                        :path="[ 
                          { lat: -19.03332, lng: -65.26274 }, 
                          ...(ruta.stops || ruta.entregas).map((s:any) => ({ lat: s.latitud, lng: s.longitud })), 
                          { lat: -19.03332, lng: -65.26274 } 
                        ]"
                        :color="colors[idx % colors.length]"
                        :weight="routeMode === 'osrm' ? 4 : 2"
                        :dashArray="routeMode === 'straight' ? '5, 10' : ''"
                        :mode="routeMode"
                      />

                      <MapMarker 
                        v-for="stop in (ruta.stops || ruta.entregas)" 
                        :key="stop.pointId || stop.puntoEntregaId"
                        :position="{ lat: stop.latitud, lng: stop.longitud }"
                      >
                        <div class="p-1">
                          <h4 class="font-bold text-slate-800 text-sm border-b pb-1 mb-1" :style="{ color: colors[idx % colors.length] }">
                            {{ stop.pointId || stop.puntoEntregaId }}
                          </h4>
                          <ul class="text-xs text-slate-600 space-y-1 mt-1">
                            <li><span class="font-semibold">Vehículo:</span> {{ ruta.vehicleId || ruta.vehiculoId }}</li>
                            <li><span class="font-semibold">Orden:</span> #{{ stop.order || stop.orden }}</li>
                            <li><span class="font-semibold">Llegada:</span> {{ stop.estimatedArrival || 'N/A' }}</li>
                          </ul>
                        </div>
                      </MapMarker>
                    </template>
                  </BaseMap>
                </div>
              </div>
            </TabPanel>
            
            <TabPanel header="Cronograma y Paradas">
              <div class="bg-white overflow-hidden">
                <div class="p-4 border-b border-slate-100 font-semibold flex justify-between items-center bg-slate-50">
                  <span class="text-slate-700"><i class="pi pi-list mr-2"></i>Solución Detallada ({{ resultado.resultado.metrics?.vehiclesUsed || resultado.resultado.vehiculosUtilizados }} vehículos)</span>
                  <Tag :value="(resultado.status === 'COMPLETADA' || resultado.resultado.status === 'SUCCESS') ? 'Factible' : 'Inválido'" :severity="(resultado.status === 'COMPLETADA' || resultado.resultado.status === 'SUCCESS') ? 'success' : 'danger'"></Tag>
                </div>
                <div class="divide-y divide-slate-100 overflow-y-auto max-h-[500px]">
                  <div v-for="(ruta, index) in resultado.resultado.routes || resultado.resultado.rutas" :key="index" class="p-5 hover:bg-slate-50 transition-colors">
                    <!-- Cabecera de la Ruta -->
                    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                      <div class="flex items-center gap-2">
                        <div class="bg-slate-800 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                          {{ index + 1 }}
                        </div>
                        <div>
                          <span class="font-bold text-slate-800 block">{{ ruta.vehicleId || ruta.vehiculoId }}</span>
                          <span class="text-xs text-slate-500">{{ ruta.stops ? ruta.stops.length : (ruta.entregas ? ruta.entregas.length : 0) }} paradas programadas</span>
                        </div>
                      </div>
                      <div class="flex gap-2 text-xs font-semibold">
                        <span class="bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100"><i class="pi pi-map-marker mr-1"></i>{{ ruta.distanceKm || ruta.distanciaKm }} km</span>
                        <span class="bg-orange-50 text-orange-700 px-2 py-1 rounded border border-orange-100" v-if="ruta.timeEstimatedMin"><i class="pi pi-clock mr-1"></i>{{ ruta.timeEstimatedMin }} min</span>
                        <span class="bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100" v-if="ruta.load?.weight"><i class="pi pi-box mr-1"></i>{{ ruta.load.weight }} kg</span>
                      </div>
                    </div>
                    
                    <!-- Cronograma de Paradas -->
                    <div class="ml-4 pl-4 border-l-2 border-slate-200 space-y-3 mt-2">
                      <div v-for="entrega in (ruta.stops || ruta.entregas)" :key="entrega.order || entrega.orden" class="relative">
                        <div class="absolute -left-[23px] top-1 w-3 h-3 bg-white border-2 border-slate-300 rounded-full"></div>
                        <div class="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <div>
                            <span class="text-xs font-bold text-slate-400 mr-2">#{{ entrega.order || entrega.orden }}</span>
                            <span class="font-medium text-slate-700">{{ entrega.pointId || entrega.puntoEntregaId }}</span>
                          </div>
                          <div class="flex items-center gap-3 text-xs text-slate-600" v-if="entrega.estimatedArrival">
                            <div class="flex flex-col items-center">
                              <span class="text-slate-400 text-[10px] uppercase">Llegada</span>
                              <span class="font-mono font-semibold">{{ entrega.estimatedArrival }}</span>
                            </div>
                            <div class="h-6 w-px bg-slate-200"></div>
                            <div class="flex flex-col items-center">
                              <span class="text-slate-400 text-[10px] uppercase">Servicio</span>
                              <span>{{ entrega.serviceTimeMin }} min</span>
                            </div>
                            <div class="h-6 w-px bg-slate-200"></div>
                            <div class="flex flex-col items-center">
                              <span class="text-slate-400 text-[10px] uppercase">Salida</span>
                              <span class="font-mono font-semibold">{{ entrega.estimatedDeparture }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>
          </TabView>
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
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

import BaseMap from '@/components/map/BaseMap.vue';
import MapMarker from '@/components/map/MapMarker.vue';
import MapRoute from '@/components/map/MapRoute.vue';

const numPoints = ref(20);
const numVehicles = ref(3);
const seed = ref(42);
const algorithm = ref('OR_TOOLS');

const routeMode = ref<'straight' | 'osrm'>('straight');
const routeModeOptions = [
  { label: 'Línea Recta', value: 'straight' },
  { label: 'Calles (OSRM)', value: 'osrm' }
];

const algorithmOptions = [
  { label: 'Línea Base (Puro OR-Tools)', value: 'OR_TOOLS' },
  { label: 'Modelo Propuesto (K-Means + OR-Tools)', value: 'KMEANS_ORTOOLS' }
];

const isProcessing = ref(false);
const resultado = ref<any>(null);

const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

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
