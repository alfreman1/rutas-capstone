<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <div class="flex items-center gap-3">
          <Button icon="pi pi-arrow-left" text rounded @click="$router.push('/contratos')" />
          <h1 class="text-2xl font-bold text-slate-800">Contrato #{{ contratoId }}</h1>
        </div>
        <p class="text-slate-500 text-sm mt-1 ml-12">Gestión de Puntos de Entrega Satelitales</p>
      </div>
      <Button 
        label="Nuevo Punto de Entrega" 
        icon="pi pi-map-marker" 
        class="p-button-primary mt-4 md:mt-0" 
        @click="showCreateModal = true"
      />
    </div>

    <!-- Layout Dashboard: Lista + Mapa -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Lista de Puntos -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
        <div class="p-4 border-b border-slate-100 font-semibold flex justify-between items-center bg-slate-50">
          <span>Puntos Registrados</span>
          <Tag :value="puntos.length.toString()" severity="info" rounded />
        </div>
        
        <div v-if="isFetching" class="p-8 text-center text-slate-500 flex flex-col items-center justify-center flex-1">
          <i class="pi pi-spin pi-spinner text-3xl mb-2"></i>
          Cargando puntos...
        </div>
        
        <div v-else-if="puntos.length === 0" class="p-8 text-center text-slate-500 flex-1">
          No hay puntos de entrega registrados en este contrato.
        </div>

        <div v-else class="divide-y divide-slate-100 overflow-y-auto flex-1">
          <div 
            v-for="punto in puntos" 
            :key="punto.id" 
            class="p-4 hover:bg-slate-50 cursor-pointer transition-colors border-l-4"
            :class="selectedPunto?.id === punto.id ? 'border-l-blue-500 bg-blue-50/50' : 'border-l-transparent'"
            @click="selectedPunto = punto"
          >
            <div class="flex justify-between items-start mb-1">
              <span class="font-bold text-slate-800 text-sm">{{ punto.codigo }}</span>
              <Tag :value="punto.estado" :severity="punto.estado === 'ACTIVO' ? 'success' : 'danger'" class="text-[10px]" />
            </div>
            <div class="text-sm text-slate-600 truncate font-medium mb-2">{{ punto.nombre }}</div>
            <div class="flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span class="bg-slate-100 px-2 py-1 rounded"><i class="pi pi-clock mr-1"></i>{{ punto.tiempoServicioMinutos }} min</span>
              <span class="bg-slate-100 px-2 py-1 rounded"><i class="pi pi-calendar mr-1"></i>{{ punto.ventanas.length }} ventanas</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Renderizador de Mapa Visual -->
      <div class="lg:col-span-2 rounded-xl border border-slate-200 h-[600px] relative overflow-hidden bg-slate-100 shadow-sm">
        <BaseMap :options="{ center: mapCenter, zoom: mapZoom }" class="absolute inset-0">
          <MapMarker 
            v-for="punto in puntos" 
            :key="`map-${punto.id}`"
            :position="{ lat: punto.latitud, lng: punto.longitud }"
            :title="punto.nombre"
          >
            <div class="p-2 min-w-[150px]">
              <div class="font-bold border-b pb-1 mb-2">{{ punto.codigo }}</div>
              <div class="text-sm text-slate-700 mb-1">{{ punto.nombre }}</div>
              <div class="text-xs text-slate-500"><i class="pi pi-map-marker mr-1"></i>{{ punto.latitud.toFixed(4) }}, {{ punto.longitud.toFixed(4) }}</div>
            </div>
          </MapMarker>
        </BaseMap>
      </div>

    </div>

    <!-- Modal Crear Punto -->
    <Dialog v-model:visible="showCreateModal" modal header="Nuevo Punto de Entrega" :style="{ width: '600px' }">
      <div class="space-y-4 pt-4">
        
        <div class="bg-blue-50 border border-blue-100 p-3 rounded-lg text-sm text-blue-800 flex gap-2">
          <i class="pi pi-info-circle mt-0.5"></i>
          <p>Para simplificar el registro manual, las coordenadas se pueden obtener seleccionando un punto en el mapa desde la web, o ingresándolas directamente.</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Código</label>
            <InputText v-model="form.codigo" class="w-full" placeholder="Ej. PT-01" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
            <InputText v-model="form.nombre" class="w-full" placeholder="Ej. Sucursal Central" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Latitud</label>
            <InputNumber v-model="form.latitud" :minFractionDigits="4" :maxFractionDigits="7" class="w-full" placeholder="-20.5" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Longitud</label>
            <InputNumber v-model="form.longitud" :minFractionDigits="4" :maxFractionDigits="7" class="w-full" placeholder="-65.0" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Tiempo Servicio (min)</label>
            <InputNumber v-model="form.tiempoServicioMinutos" :min="1" class="w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Ventana Horaria (Default)</label>
            <div class="flex items-center gap-2">
              <InputText type="time" v-model="form.horaInicio" class="w-full" />
              <span>-</span>
              <InputText type="time" v-model="form.horaFin" class="w-full" />
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="showCreateModal = false" />
        <Button label="Agregar Punto" icon="pi pi-check" @click="guardar" :loading="isCreando" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { usePuntosEntrega } from '../composables/useContratos';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import BaseMap from '@/components/map/BaseMap.vue';
import MapMarker from '@/components/map/MapMarker.vue';

const route = useRoute();
const contratoId = route.params.id as string;

const { puntos, isFetching, agregarPunto, isCreando } = usePuntosEntrega(contratoId);

const selectedPunto = ref<any>(null);

// Lógica de centrado del mapa
const mapCenter = computed(() => {
  if (selectedPunto.value) {
    return { lat: selectedPunto.value.latitud, lng: selectedPunto.value.longitud };
  }
  if (puntos.value.length > 0) {
    return { lat: puntos.value[0].latitud, lng: puntos.value[0].longitud };
  }
  return { lat: -20.6, lng: -64.9 }; // Default Culpina
});

const mapZoom = computed(() => {
  return selectedPunto.value ? 15 : 12;
});

const showCreateModal = ref(false);
const form = ref({
  codigo: '',
  nombre: '',
  latitud: null as number | null,
  longitud: null as number | null,
  tiempoServicioMinutos: 15,
  horaInicio: '08:00',
  horaFin: '18:00',
});

const guardar = async () => {
  if (!form.value.latitud || !form.value.longitud) return;

  const payload: any = {
    codigo: form.value.codigo,
    nombre: form.value.nombre,
    latitud: form.value.latitud,
    longitud: form.value.longitud,
    tiempoServicioMinutos: form.value.tiempoServicioMinutos,
  };

  // Armamos una ventana base según el mock (En un ISO Date arbitrario porque solo importa la hora en la IA)
  if (form.value.horaInicio && form.value.horaFin) {
    payload.ventanas = [{
      horaInicio: `2026-01-01T${form.value.horaInicio}:00Z`,
      horaFin: `2026-01-01T${form.value.horaFin}:00Z`,
    }];
  }

  await agregarPunto(payload);
  showCreateModal.value = false;
  form.value = { codigo: '', nombre: '', latitud: null, longitud: null, tiempoServicioMinutos: 15, horaInicio: '08:00', horaFin: '18:00' };
};
</script>
