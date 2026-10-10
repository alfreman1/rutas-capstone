<template>
  <div class="relative w-full h-full min-h-[300px] bg-slate-100 rounded-xl overflow-hidden shadow-inner">
    <!-- El contenedor donde la librería de mapas (ej. Leaflet o Google Maps) se montará -->
    <div ref="mapContainer" class="w-full h-full z-0"></div>
    
    <!-- Slot para inyectar componentes abstractos como MapMarker o MapRoute -->
    <slot v-if="isReady"></slot>

    <!-- Loader mientras se inicializa el mapa -->
    <div v-if="!isReady" class="absolute inset-0 bg-slate-100/80 flex items-center justify-center z-10 backdrop-blur-sm">
      <i class="pi pi-spinner animate-spin text-3xl text-blue-500"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, provide, shallowRef } from 'vue';
import type { MapOptions, MapCoordinates } from './map.types';
import { MAP_INSTANCE_KEY, MAP_READY_KEY } from './map.types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icons in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const props = withDefaults(defineProps<{
  options?: Partial<MapOptions>
}>(), {
  options: () => ({
    center: { lat: -20.0, lng: -65.0 }, // Coordenadas genéricas para Bolivia/Culpina
    zoom: 6
  })
});

const emit = defineEmits<{
  (e: 'ready', mapInstance: any): void;
  (e: 'click', coords: MapCoordinates): void;
}>();

const mapContainer = ref<HTMLElement | null>(null);
const mapInstance = shallowRef<L.Map | null>(null);
const isReady = ref(false);

// Proveemos el mapa a los hijos
provide(MAP_INSTANCE_KEY, mapInstance);
provide(MAP_READY_KEY, isReady);

onMounted(() => {
  if (!mapContainer.value) return;

  const center: [number, number] = [props.options.center!.lat, props.options.center!.lng];
  
  // Inicializamos Leaflet (La implementación concreta está aislada aquí)
  const map = L.map(mapContainer.value, {
    zoomControl: false, // Ocultar para usar un MapControls personalizado después
  }).setView(center, props.options.zoom);

  // Agregar capa base (OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: props.options.maxZoom || 19,
    minZoom: props.options.minZoom || 3
  }).addTo(map);

  map.on('click', (e: L.LeafletMouseEvent) => {
    emit('click', { lat: e.latlng.lat, lng: e.latlng.lng });
  });

  // Guardamos la instancia
  mapInstance.value = map;
  isReady.value = true;
  
  emit('ready', map);
});

onBeforeUnmount(() => {
  if (mapInstance.value) {
    mapInstance.value.remove();
    mapInstance.value = null;
  }
});
</script>

<style>
/* Forzar que los popups de leaflet no rompan el estilo de tailwind */
.leaflet-container {
  font-family: inherit;
}
.leaflet-popup-content-wrapper {
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}
</style>
