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
  mode?: 'straight' | 'osrm';
}>(), {
  color: '#3b82f6', // blue-500
  weight: 4,
  opacity: 0.8,
  mode: 'straight'
});

const mapInstance = inject(MAP_INSTANCE_KEY);
const isMapReady = inject(MAP_READY_KEY);

const polylineInstance = ref<L.Polyline | null>(null);

const fetchOsrmRoute = async (coordinates: MapCoordinates[]): Promise<[number, number][]> => {
  if (coordinates.length < 2) return coordinates.map(p => [p.lat, p.lng]);
  
  // OSRM espera longitud,latitud
  const coordsString = coordinates.map(c => `${c.lng},${c.lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      // GeoJSON devuelve [lng, lat], Leaflet espera [lat, lng]
      const geojsonCoords = data.routes[0].geometry.coordinates;
      return geojsonCoords.map((c: number[]) => [c[1], c[0]]);
    }
  } catch (error) {
    console.error('Error fetching OSRM route:', error);
  }
  // Fallback a straight line
  return coordinates.map(p => [p.lat, p.lng]);
};

const drawPolyline = async () => {
  if (!mapInstance?.value) return;
  
  if (polylineInstance.value) {
    mapInstance.value.removeLayer(polylineInstance.value);
  }

  let latlngs: [number, number][] = [];
  
  if (props.mode === 'osrm') {
    latlngs = await fetchOsrmRoute(props.path);
  } else {
    latlngs = props.path.map(p => [p.lat, p.lng]);
  }

  polylineInstance.value = L.polyline(latlngs, {
    color: props.color,
    weight: props.weight,
    opacity: props.opacity,
    dashArray: props.dashArray
  }).addTo(mapInstance.value);
};

const initPolyline = () => {
  drawPolyline();
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

// Reactividad si cambia la ruta o el modo
watch([() => props.path, () => props.mode], () => {
  if (isMapReady?.value) {
    drawPolyline();
  }
}, { deep: true });

onBeforeUnmount(() => {
  if (polylineInstance.value && mapInstance?.value) {
    mapInstance.value.removeLayer(polylineInstance.value);
  }
});
</script>
