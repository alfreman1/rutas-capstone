# LogiRoute - Frontend Web & PWA

Panel Administrativo y Aplicación Móvil (PWA) de la plataforma logística, desarrollado en **Vue 3 (Composition API), TypeScript, PrimeVue y TailwindCSS**.

## Arquitectura

La arquitectura de este frontend es estrictamente modular por dominio y no por tipo técnico. Utiliza:
- **Vite** como bundler principal.
- **Pinia** para el estado global (sesión, roles, datos esenciales en cliente).
- **TanStack Vue Query** para todo el estado asíncrono y de servidor (fetching, caching, paginación server-side).
- **PrimeVue** para componentes interactivos avanzados (DataTables con lazy loading, modales, menús).
- **TailwindCSS** para diagramación visual (grid, flexbox, tipografía).

## Módulos Principales

Cada funcionalidad tiene su propio Bounded Context dentro de `src/modules/`:
- `auth`: Autenticación, JWT, Login.
- `dashboard`: Métricas generales, KPI ejecutivos.
- `contratos` / `puntos-entrega`: ABM y mapas de destinos.
- `planificaciones` / `optimizaciones`: Interfaces críticas para interactuar con la Capa de IA de manera asíncrona (mostrando estados de "Procesando", "Completada" y cuadros de "Ahorro de distancia").
- `rutas`: Visualización en mapa de polígonos/marcadores correspondientes a los recorridos entregados.

## Preparación Móvil (PWA)

El Frontend está diseñado de forma *Mobile-First* en sus vistas operativas para conductores. A través del plugin `vite-plugin-pwa`, se proveerá capacidad de instalación, almacenamiento en caché de rutas y registro de entregas offline, que serán sincronizadas utilizando TanStack Query cuando recupere señal de red.

## Ejecución

```bash
# Instalar dependencias
npm install

# Correr en modo desarrollo local (port 5173 por defecto)
# Nota: Vite está proxyando /api/v1 hacia http://localhost:3000 (NestJS)
npm run dev

# Compilar para producción (incluye chequeo estricto TypeScript)
npm run build
```
