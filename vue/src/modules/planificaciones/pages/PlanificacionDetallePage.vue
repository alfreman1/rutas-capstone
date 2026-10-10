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
    <div v-if="estadoLocal !== 'PROCESANDO'" class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
      <h2 class="text-lg font-semibold text-slate-800 mb-4">Configurar Optimización de Rutas</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="space-y-4 col-span-2">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Vehículos Disponibles</label>
            <MultiSelect 
              v-model="vehiculosSeleccionados" 
              :options="vehiculos" 
              optionLabel="placa" 
              optionValue="id" 
              placeholder="Seleccionar vehículos" 
              class="w-full" 
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Estrategia Algorítmica</label>
            <Dropdown 
              v-model="algoritmoSeleccionado" 
              :options="algoritmosDisponibles" 
              optionLabel="label"
              optionValue="value"
              class="w-full" 
            />
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
    <div v-else-if="estadoLocal === 'GENERANDO' || estadoLocal === 'PROCESANDO'" class="bg-indigo-50 p-8 rounded-xl border border-indigo-100 flex flex-col items-center justify-center text-center space-y-4">
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
      
      <div class="mt-6 pt-4 border-t border-indigo-100 flex flex-col items-center">
        <p class="text-xs text-indigo-500 mb-2">¿La carga demora demasiado?</p>
        <Button 
          icon="pi pi-refresh" 
          label="Consultar estado manualmente" 
          size="small" 
          outlined 
          severity="info" 
          @click="consultarEstadoManual()" 
          :loading="isPolling"
        />
      </div>
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

      <!-- Map & Routes View (Mockup matched) -->
      <div class="mt-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-slate-800 flex items-center">
            <span class="mr-2">Mapa de rutas</span>
          </h2>
          <div class="w-64">
             <Dropdown v-model="selectedRouteIndex" :options="routeOptions" optionLabel="label" optionValue="value" placeholder="Todas las rutas" class="w-full" />
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Map Visualizer (Left side, takes 2 cols) -->
          <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px] relative overflow-hidden">
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

              <template v-for="(ruta, index) in metricas.rutas" :key="`route-${index}`">
                <MapRoute 
                  v-if="selectedRouteIndex === -1 || selectedRouteIndex === index"
                  :path="getRutaCoordenadas(ruta)" 
                  :color="getRouteColor(index)" 
                  :weight="4" 
                  :mode="mapRouteMode"
                />
                
                <MapMarker 
                  v-if="selectedRouteIndex === -1 || selectedRouteIndex === index"
                  v-for="(entrega, i) in ruta.entregas" 
                  :key="`marker-${index}-${i}`"
                  :position="{ lat: entrega.latitud, lng: entrega.longitud }"
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

          <!-- Details Sidebar (Right side, 1 col) -->
          <div class="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full max-h-[600px]">
            <div class="p-4 border-b border-slate-100 font-bold text-slate-800 text-lg">
              Detalle de rutas
            </div>
            
            <div class="flex-1 overflow-y-auto p-0" v-if="metricas.rutas.length > 0">
              <div v-for="(ruta, index) in metricas.rutas" :key="`detail-${index}`" 
                   v-show="selectedRouteIndex === -1 || selectedRouteIndex === index"
                   class="p-5 border-b border-slate-100 last:border-0"
              >
                <!-- Badge Vehículo -->
                <div class="mb-4">
                  <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                    {{ ruta.vehiculoId || `VEH-00${index + 1}` }}
                  </span>
                </div>
                
                <!-- Métricas de ruta -->
                <div class="space-y-3 mb-6 text-sm">
                  <div class="flex justify-between items-center text-slate-600">
                    <span class="flex items-center"><i class="pi pi-map-marker mr-2 text-slate-400"></i> Distancia</span>
                    <span class="font-bold text-slate-800">{{ ruta.distanciaKm || '18.35' }} km</span>
                  </div>
                  <div class="flex justify-between items-center text-slate-600">
                    <span class="flex items-center"><i class="pi pi-box mr-2 text-slate-400"></i> Carga</span>
                    <span class="font-bold text-slate-800">{{ ruta.carga || '1,066' }} kg</span>
                  </div>
                </div>

                <!-- Lista de paradas -->
                <div>
                  <h3 class="font-bold text-slate-800 mb-3">Paradas</h3>
                  <div class="space-y-3">
                    <div class="flex items-start text-sm">
                      <span class="w-6 font-medium text-slate-400 text-right mr-3">1.</span>
                      <span class="text-slate-700">Almacén (inicio)</span>
                    </div>
                    
                    <div v-for="(entrega, i) in ruta.entregas" :key="`entrega-${i}`" class="flex items-start text-sm">
                      <span class="w-6 font-medium text-slate-400 text-right mr-3">{{ i + 2 }}.</span>
                      <span class="text-slate-700">{{ entrega.puntoEntregaId || `PNT-0${i + 1}9` }}</span>
                    </div>
                    
                    <div class="flex items-start text-sm text-slate-400">
                      <span class="w-6 font-medium text-right mr-3">...</span>
                      <span>...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="p-8 text-center text-slate-500">
              <i class="pi pi-map mb-2 text-2xl"></i>
              <p>No hay rutas generadas aún.</p>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { usePlanificacionOptimizacion } from '../composables/usePlanificacionOptimizacion';
import { useVehiculos } from '../../vehiculos/composables/useVehiculos';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import MultiSelect from 'primevue/multiselect';
import Dropdown from 'primevue/dropdown';
import ProgressBar from 'primevue/progressbar';
import SelectButton from 'primevue/selectbutton';
import BaseMap from '@/components/map/BaseMap.vue';
import MapMarker from '@/components/map/MapMarker.vue';
import MapRoute from '@/components/map/MapRoute.vue';

const route = useRoute();
const planificacionId = route.params.id as string;

// Composable de TanStack Query
const { 
  estadoOptimizacion, 
  solicitarOptimizacion, 
  isSolicitando, 
  isErrorSolicitud, 
  isPollingEnabled,
  isPolling,
  consultarEstadoManual
} = usePlanificacionOptimizacion(planificacionId);

// Estado UI Local
const estadoLocal = ref('BORRADOR'); // BORRADOR | GENERANDO | PROCESANDO | COMPLETADA | ERROR
const algoritmoSeleccionado = ref('KMEANS_ORTOOLS');
const algoritmosDisponibles = [
  { label: 'K-Means + OR-Tools CVRP', value: 'KMEANS_ORTOOLS' },
  { label: 'DBSCAN + OR-Tools CVRP', value: 'DBSCAN_ORTOOLS' },
  { label: 'Puro OR-Tools (Global)', value: 'PURE_ORTOOLS' }
];
// Vehiculos Reales
const { vehiculos } = useVehiculos();
const vehiculosSeleccionados = ref<string[]>([]);

// Opciones de Ruteo en el Mapa
const mapRouteMode = ref<'straight' | 'osrm'>('straight');
const routeModeOptions = [
  { label: 'Líneas', value: 'straight' },
  { label: 'Calles (OSRM)', value: 'osrm' }
];

const metricas = ref({
  distanciaTotalKm: 0,
  tiempoTotalMinutos: 0,
  vehiculosUtilizados: 0,
  rutas: [] as any[]
});

const selectedRouteIndex = ref(-1);

const routeOptions = computed(() => {
  const options = [{ label: 'Todas las rutas', value: -1 }];
  if (metricas.value.rutas) {
    metricas.value.rutas.forEach((r, i) => {
      options.push({ label: `Ruta ${r.vehiculoId || i + 1}`, value: i });
    });
  }
  return options;
});

// Vigilar el estado asíncrono
watch(estadoOptimizacion, (nuevoEstado) => {
  if (nuevoEstado) {
    estadoLocal.value = nuevoEstado.estado;
    
    if ((nuevoEstado.estado === 'COMPLETADA' || nuevoEstado.estado === 'GENERADA') && nuevoEstado.resultado) {
      // Detener polling (aunque usePlanificacion ya lo detiene si no es PROCESANDO/GENERANDO)
      isPollingEnabled.value = false; 
      metricas.value = nuevoEstado.resultado;
    } else if (nuevoEstado.estado === 'ERROR') {
      isPollingEnabled.value = false;
    }
  }
}, { deep: true });

watch(isErrorSolicitud, (hasError) => {
  if (hasError && (estadoLocal.value === 'PROCESANDO' || estadoLocal.value === 'GENERANDO')) {
    estadoLocal.value = 'BORRADOR'; // Revert UI so user can try again
  }
});

const ejecutarOptimizacion = () => {
  // Simulamos que al clickear cambia la UI y enviamos la mutación al Backend
  if (vehiculosSeleccionados.value.length === 0) return;
  
  estadoLocal.value = 'GENERANDO';
  solicitarOptimizacion({
    vehiculosIds: vehiculosSeleccionados.value,
    algoritmo: algoritmoSeleccionado.value
  });
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

const getRutaCoordenadas = (ruta: any) => {
  const coords = [{ lat: -20.6, lng: -64.9 }]; // Start at warehouse
  ruta.entregas.forEach((e: any) => {
    coords.push({ lat: e.latitud, lng: e.longitud });
  });
  coords.push({ lat: -20.6, lng: -64.9 }); // Return to warehouse
  return coords;
};
</script>
