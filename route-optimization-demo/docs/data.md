# Datos y supuestos

## Datos de cada pedido

| Campo | Significado | Validación |
|---|---|---|
| `id` | Identificador del pedido | Entero 1–999, sin repetir |
| `x`, `y` | Posición en cuadras, no latitud/longitud | Enteros 0–20 |
| `demand` | Cajas a entregar juntas | Entero 1–60 |
| `service_minutes` | Tiempo de descarga | Entero 0–30; predeterminado 5 |

El depósito tiene ID 0 y posición (10,10). No consume carga ni tiempo de servicio. Una cuadra representa 500 m. El generador usa posiciones diferentes, evita el depósito y asigna demandas de 2–5 cajas; la API también admite pedidos distintos en la misma posición.

## Datos de la flota

`vehicles`: entre 1 y 6. `capacity`: entre 1 y 60 cajas por vehículo. `max_minutes`: duración máxima de cada recorrido, entre 10 y 480 minutos. `speed_kmh`: velocidad constante, entre 10 y 60 km/h. Son enteros estrictos: no se aceptan booleanos, cadenas numéricas ni números fraccionarios.

Cada pedido cabe en un único vehículo y no se divide. Los vehículos son iguales y hacen a lo sumo un viaje. No es obligatorio utilizarlos todos.

## Generación reproducible

`generate_scenario` usa `random.Random(seed)`, selecciona coordenadas y luego cargas. La misma semilla y cantidad producen exactamente los mismos pedidos con esta implementación. Cambiar cantidad puede cambiar también las cargas anteriores porque cambia la secuencia de muestreo; no debe interpretarse como agregar pedidos a una jornada ya existente.

La semilla no entrena ni controla un modelo predictivo. Los pedidos sintéticos no provienen de clientes reales. Los seis escenarios predefinidos se describen en `app/data.py` y se exportan a `data/scenarios.json`. La API los construye desde esa función: editar solamente el JSON exportado no cambia los presets del servidor.

## Distancias y tiempos

La distancia entre A y B es:

```text
meters = 500 × (abs(A.x - B.x) + abs(A.y - B.y))
travel_seconds = ceil(meters × 3600 / (speed_kmh × 1000))
```

Se redondea cada tiempo de viaje hacia arriba al segundo. Ambos métodos utilizan exactamente las mismas reglas. El costo de una ruta incluye cada viaje desde el depósito, entre pedidos y de regreso. El tiempo suma además todas las descargas una sola vez.

No hay tráfico ni direcciones de calles, de modo que A → B tiene la misma distancia que B → A. El SVG muestra un camino horizontal seguido de uno vertical, uno de varios trayectos posibles de igual distancia en esta cuadrícula ideal.

## Para pasar a un caso real

Serían necesarias ubicaciones verificadas, cargas homogéneas en unidades adecuadas, tiempos de servicio y matrices de distancias/tiempos de una red vial. Habría que adaptar el mapa y el solver para usar las mismas matrices; sustituir las líneas visuales sin cambiar el costo produciría una comparación incorrecta.

Los IDs, direcciones y posiciones nunca deben confundirse: el algoritmo usa IDs para identificar pedidos, índices internos para construir el problema y coordenadas para calcular distancias. Los tests incluyen IDs no consecutivos.
