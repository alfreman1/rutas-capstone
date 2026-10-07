<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold text-slate-800">Planificación #{{ route.params.id }}</h1>
          <Tag :value="estadoLocal" :severity="getSeverity(estadoLocal)" class="text-sm font-bold px-3 py-1" />
        </div>
        <p class="text-slate-500 text-sm mt-1">Jornada 2026-10-06 • 87 Puntos de entrega</p>
      </div>
    </div>

    <!-- Optimization Dashboard -->
    <div v-if="estadoLocal === 'BORRADOR' || estadoLocal === 'ERROR'" class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 class="text-lg font-semibold text-slate-800 mb-4">Configurar Optimización de Rutas</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="space-y-4 col-span-2">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Vehículos Disponibles</label>
            <MultiSelect 
              v-model="vehiculosSeleccionados" 
              :options="vehiculosMock" 
              optionLabel="placa" 
              optionValue="id" 
              placeholder="Seleccionar vehículos" 
              class="w-full" 
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Algoritmo</label>
            <Select v-model="algoritmo" :options="['VRP (Google OR-Tools)', 'DBSCAN + TSP']" class="w-full" />
          </div>
        </div>
        
        <div class="flex flex-col justify-end">
          <Button 
            label="Optimizar Rutas (IA)" 
            icon="pi pi-sparkles" 
            class="w-full p-button-primary p-button-lg" 
            :loading="isSolicitando"
            @click="ejecutarOptimizacion" 
            :disabled="vehiculosSeleccionados.length === 0"
          />
        </div>
      </div>
    </div>

    <!-- Processing State -->
    <div v-else-if="estadoLocal === 'PROCESANDO'" class="bg-indigo-50 p-8 rounded-xl border border-indigo-100 flex flex-col items-center justify-center text-center space-y-4">
      <div class="w-16 h-16 relative">
        <div class="absolute inset-0 rounded-full border-4 border-indigo-200"></div>
        <div class="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
        <i class="pi pi-sparkles text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl"></i>
      </div>
      <div>
        <h3 class="text-xl font-bold text-indigo-900">IA Procesando Rutas...</h3>
        <p class="text-indigo-700 mt-2 max-w-md">El motor matemático está evaluando las combinaciones posibles respetando las ventanas horarias y capacidades.</p>
      </div>
      <ProgressBar mode="indeterminate" style="height: 6px; width: 300px" class="mt-4"></ProgressBar>
    </div>

    <!-- Results State -->
    <div v-else-if="estadoLocal === 'COMPLETADA' || estadoLocal === 'GENERADA'" class="space-y-6">
      
      <!-- Metrics Comparison -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 border-l-4 border-l-emerald-500">
          <div class="text-sm text-slate-500 mb-1">Distancia Total</div>
          <div class="text-2xl font-bold text-slate-800">{{ metricas.distanciaTotalKm }} km</div>
          <div class="text-xs text-emerald-600 font-semibold mt-1"><i class="pi pi-arrow-down text-[10px]"></i> 18% vs histórico</div>
        </div>
        
        <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-blue-500">
          <div class="text-sm text-slate-500 mb-1">Tiempo de Operación</div>
          <div class="text-2xl font-bold text-slate-800">{{ Math.floor(metricas.tiempoTotalMinutos / 60) }}h {{ metricas.tiempoTotalMinutos % 60 }}m</div>
        </div>

        <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-purple-500">
          <div class="text-sm text-slate-500 mb-1">Vehículos Utilizados</div>
          <div class="text-2xl font-bold text-slate-800">{{ metricas.vehiculosUtilizados }}</div>
        </div>

        <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <Button label="Aprobar Planificación" severity="success" class="w-full" />
        </div>
      </div>

      <!-- Map & Routes View -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- List -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="p-4 border-b border-slate-100 font-semibold flex justify-between items-center">
            <span>Rutas Generadas</span>
            <Tag :value="metricas.rutas.length.toString()" severity="info" rounded />
          </div>
          <div class="divide-y divide-slate-100 overflow-y-auto max-h-[500px]">
            <div v-for="(ruta, index) in metricas.rutas" :key="index" class="p-4 hover:bg-slate-50 cursor-pointer transition-colors">
              <div class="flex justify-between items-start mb-2">
                <span class="font-bold text-slate-800">Ruta {{ index + 1 }}</span>
                <span class="text-xs font-semibold bg-slate-100 px-2 py-1 rounded text-slate-600">{{ ruta.distanciaKm }} km</span>
              </div>
              <div class="text-sm text-slate-500 mb-2">
                <i class="pi pi-truck mr-1"></i> Vehículo: {{ ruta.vehiculoId }}
              </div>
              <div class="flex items-center text-xs text-slate-400">
                <i class="pi pi-map-marker mr-1"></i> {{ ruta.entregas.length }} paradas
              </div>
            </div>
          </div>
        </div>

        <!-- Map Visualizer -->
        <div class="lg:col-span-2 rounded-xl border border-slate-200 min-h-[500px] relative overflow-hidden">
          <BaseMap 
            :options="{ center: { lat: -20.6, lng: -64.9 }, zoom: 11 }" 
            class="absolute inset-0"
          >
            <!-- Centro de Distribución (Almacén) -->
            <MapMarker :position="{ lat: -20.6, lng: -64.9 }" title="Almacén Central">
              <div class="p-2 text-center">
                <i class="pi pi-building text-blue-600 text-xl mb-1 block"></i>
                <span class="font-bold">Culpina SRL</span>
              </div>
            </MapMarker>

            <!-- Rutas Generadas (Trazado Vectorial) -->
            <template v-for="(ruta, index) in metricas.rutas" :key="`route-${index}`">
              <MapRoute 
                :path="getRutaCoordenadas(ruta)" 
                :color="getRouteColor(index)" 
                :weight="4" 
              />
              
              <!-- Puntos de Entrega de cada ruta -->
              <MapMarker 
                v-for="(entrega, i) in ruta.entregas" 
                :key="`marker-${index}-${i}`"
                :position="getCoordenadasMock(entrega.puntoEntregaId)"
                :title="`Punto: ${entrega.puntoEntregaId}`"
              >
                <div class="text-xs">
                  <span class="block font-bold">Orden: {{ entrega.orden }}</span>
                  <span class="block text-slate-500">Ruta: {{ index + 1 }}</span>
                </div>
              </MapMarker>
            </template>
          </BaseMap>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { usePlanificacionOptimizacion } from '../composables/usePlanificacionOptimizacion';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import MultiSelect from 'primevue/multiselect';
import Select from 'primevue/select';
import ProgressBar from 'primevue/progressbar';
import BaseMap from '@/components/map/BaseMap.vue';
import MapMarker from '@/components/map/MapMarker.vue';
import MapRoute from '@/components/map/MapRoute.vue';

const route = useRoute();
const planificacionId = route.params.id as string;

// Composable de TanStack Query
const { estadoOptimizacion, solicitarOptimizacion, isSolicitando, isPollingEnabled } = usePlanificacionOptimizacion(planificacionId);

// Estado UI Local
const estadoLocal = ref('BORRADOR'); // BORRADOR | PROCESANDO | COMPLETADA | ERROR
const algoritmo = ref('VRP (Google OR-Tools)');
const vehiculosSeleccionados = ref(['v1', 'v2']); // Mock seleccionado por defecto

// Mock data
const vehiculosMock = [
  { id: 'v1', placa: 'ABC-123 (Furgón 3.5T)' },
  { id: 'v2', placa: 'XYZ-987 (Camión 5T)' },
  { id: 'v3', placa: 'DEF-456 (Furgón 3.5T)' }
];

const metricas = ref({
  distanciaTotalKm: 0,
  tiempoTotalMinutos: 0,
  vehiculosUtilizados: 0,
  rutas: [] as any[]
});

// Vigilar el estado asíncrono
watch(estadoOptimizacion, (nuevoEstado) => {
  if (nuevoEstado) {
    estadoLocal.value = nuevoEstado.estado;
    
    if (nuevoEstado.estado === 'COMPLETADA' && nuevoEstado.resultado) {
      // Detener polling (aunque usePlanificacion ya lo detiene si no es PROCESANDO)
      isPollingEnabled.value = false; 
      metricas.value = nuevoEstado.resultado;
    } else if (nuevoEstado.estado === 'ERROR') {
      isPollingEnabled.value = false;
    }
  }
}, { deep: true });

const ejecutarOptimizacion = () => {
  // Simulamos que al clickear cambia la UI y enviamos la mutación al Backend
  estadoLocal.value = 'PROCESANDO';
  solicitarOptimizacion(vehiculosSeleccionados.value);
};

const getSeverity = (status: string) => {
  switch (status) {
    case 'COMPLETADA':
    case 'GENERADA':
      return 'success';
    case 'BORRADOR':
      return 'secondary';
    case 'PROCESANDO':
      return 'info';
    case 'ERROR':
      return 'danger';
    default:
      return 'secondary';
  }
};

// Utils funcionales para el mapa (Mocks visuales)
const routeColors = ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#14b8a6'];

const getRouteColor = (index: number) => {
  return routeColors[index % routeColors.length];
};

const getCoordenadasMock = (puntoId: string) => {
  // Generamos algo de ruido basado en el ID para que los puntos se dispersen en el mapa alrededor del centro
  const hash = puntoId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return {
    lat: -20.6 + (hash % 10) * 0.01 * (hash % 2 === 0 ? 1 : -1),
    lng: -64.9 + (hash % 7) * 0.015 * (hash % 3 === 0 ? 1 : -1)
  };
};

const getRutaCoordenadas = (ruta: any) => {
  const coords = [{ lat: -20.6, lng: -64.9 }]; // Start at warehouse
  ruta.entregas.forEach((e: any) => {
    coords.push(getCoordenadasMock(e.puntoEntregaId));
  });
  coords.push({ lat: -20.6, lng: -64.9 }); // Return to warehouse
  return coords;
};
</script>
