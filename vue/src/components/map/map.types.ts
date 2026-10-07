import type { InjectionKey, Ref } from 'vue';

export interface MapCoordinates {
  lat: number;
  lng: number;
}

export interface MapBounds {
  northEast: MapCoordinates;
  southWest: MapCoordinates;
}

export interface MapOptions {
  center: MapCoordinates;
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
}

// Inyectores para Vue Provide/Inject
// Permiten que los componentes hijos (MapMarker, MapRoute) accedan a la instancia del mapa subyacente (ej. Leaflet map) sin acoplarse directamente a la librería.
export const MAP_INSTANCE_KEY = Symbol('MAP_INSTANCE') as InjectionKey<Ref<any>>;
export const MAP_READY_KEY = Symbol('MAP_READY') as InjectionKey<Ref<boolean>>;
