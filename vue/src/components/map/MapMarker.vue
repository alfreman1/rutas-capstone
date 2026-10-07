<template>
  <div style="display: none;">
    <!-- El slot se renderiza de forma invisible, útil si queremos extraer su HTML para usarlo como custom popup -->
    <div ref="popupContent">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, onBeforeUnmount, watch, ref } from 'vue';
import { MAP_INSTANCE_KEY, MAP_READY_KEY, MapCoordinates } from './map.types';
import L from 'leaflet';

const props = withDefaults(defineProps<{
  position: MapCoordinates;
  title?: string;
  color?: string; // Para soportar marcadores de diferentes colores en un futuro
  draggable?: boolean;
}>(), {
  draggable: false
});

const emit = defineEmits<{
  (e: 'click'): void;
  (e: 'dragend', coords: MapCoordinates): void;
}>();

const mapInstance = inject(MAP_INSTANCE_KEY);
const isMapReady = inject(MAP_READY_KEY);

const markerInstance = ref<L.Marker | null>(null);
const popupContent = ref<HTMLElement | null>(null);

const initMarker = () => {
  if (!mapInstance?.value || markerInstance.value) return;

  const latlng: [number, number] = [props.position.lat, props.position.lng];

  markerInstance.value = L.marker(latlng, {
    title: props.title,
    draggable: props.draggable
  }).addTo(mapInstance.value);

  // Si hay contenido en el slot, lo atamos como Popup
  if (popupContent.value && popupContent.value.innerHTML.trim() !== '') {
    markerInstance.value.bindPopup(popupContent.value.innerHTML);
  }

  markerInstance.value.on('click', () => {
    emit('click');
  });

  markerInstance.value.on('dragend', (e) => {
    const marker = e.target;
    const position = marker.getLatLng();
    emit('dragend', { lat: position.lat, lng: position.lng });
  });
};

onMounted(() => {
  if (isMapReady?.value) {
    initMarker();
  } else {
    // Si el mapa aún no está listo, esperamos
    watch(() => isMapReady?.value, (ready) => {
      if (ready) initMarker();
    });
  }
});

// Reactividad a cambios de posición
watch(() => props.position, (newPos) => {
  if (markerInstance.value) {
    markerInstance.value.setLatLng([newPos.lat, newPos.lng]);
  }
}, { deep: true });

onBeforeUnmount(() => {
  if (markerInstance.value && mapInstance?.value) {
    mapInstance.value.removeLayer(markerInstance.value);
  }
});
</script>
