<template>
  <!-- Un polyline no renderiza DOM, solo inyecta vectores en el mapa padre -->
  <div style="display: none;"></div>
</template>

<script setup lang="ts">
import { inject, onMounted, onBeforeUnmount, watch, ref } from 'vue';
import { MAP_INSTANCE_KEY, MAP_READY_KEY, MapCoordinates } from './map.types';
import L from 'leaflet';

const props = withDefaults(defineProps<{
  path: MapCoordinates[];
  color?: string;
  weight?: number;
  opacity?: number;
  dashArray?: string;
}>(), {
  color: '#3b82f6', // blue-500
  weight: 4,
  opacity: 0.8
});

const mapInstance = inject(MAP_INSTANCE_KEY);
const isMapReady = inject(MAP_READY_KEY);

const polylineInstance = ref<L.Polyline | null>(null);

const initPolyline = () => {
  if (!mapInstance?.value || polylineInstance.value) return;

  const latlngs: [number, number][] = props.path.map(p => [p.lat, p.lng]);

  polylineInstance.value = L.polyline(latlngs, {
    color: props.color,
    weight: props.weight,
    opacity: props.opacity,
    dashArray: props.dashArray
  }).addTo(mapInstance.value);
};

onMounted(() => {
  if (isMapReady?.value) {
    initPolyline();
  } else {
    watch(() => isMapReady?.value, (ready) => {
      if (ready) initPolyline();
    });
  }
});

// Reactividad si cambia la ruta
watch(() => props.path, (newPath) => {
  if (polylineInstance.value) {
    const latlngs: [number, number][] = newPath.map(p => [p.lat, p.lng]);
    polylineInstance.value.setLatLngs(latlngs);
  }
}, { deep: true });

onBeforeUnmount(() => {
  if (polylineInstance.value && mapInstance?.value) {
    mapInstance.value.removeLayer(polylineInstance.value);
  }
});
</script>
