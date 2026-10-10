# API local

Dirección predeterminada: `http://127.0.0.1:9000`. Documentación interactiva: `/docs`.

| Método y ruta | Función |
|---|---|
| `GET /api/health` | Estado, algoritmo y límite de búsqueda |
| `GET /api/scenarios` | Depósito y seis presets |
| `POST /api/generate` | Crear pedidos por semilla y cantidad |
| `POST /api/optimize` | Resolver y verificar un escenario |
| `GET /api/benchmark` | Leer la ejecución guardada de evaluación |

## Ejemplo mínimo

El cuerpo de `/api/optimize` es:

```json
{
  "orders": [
    {"id": 1, "x": 12, "y": 10, "demand": 5, "service_minutes": 5}
  ],
  "vehicles": 1,
  "capacity": 10,
  "max_minutes": 30,
  "speed_kmh": 30
}
```

Ese caso tiene 2.000 metros de ida y regreso y 9 minutos totales: cuatro de viaje y cinco de servicio. Guarda el cuerpo en `scenario.json` y ejecuta:

```bash
curl -X POST http://127.0.0.1:9000/api/optimize \
  -H 'Content-Type: application/json' \
  --data-binary @scenario.json
```

En PowerShell usa `curl.exe` y coloca el comando en una sola línea. El endpoint de generación recibe `{"seed":42,"order_count":18}`. La semilla admite 0–9999; la cantidad, 3–30. La API de optimización también permite casos manuales de uno o dos pedidos.

## Respuesta

`scenario` conserva los datos utilizados y `scenario_sha256` su huella. `baseline` siempre describe la referencia, incluyendo rutas parciales y pedidos no asignados. `optimized` contiene el plan completo seleccionado o `null`.

`status` distingue `feasible`, `proven_infeasible` y `no_solution_found`. `reasons` contiene las contradicciones comprobadas. `solution_source` es `ortools` o `baseline_retained` cuando hay solución. `savings` solo existe como objeto si ambos planes son completos; en otros casos vale `null`.

Cada ruta informa ID de vehículo, secuencia de pedidos, llegadas y salidas en segundos desde el inicio, carga, distancia y duración. `total_duration_seconds` suma las rutas; `makespan_seconds` es el último regreso simultáneo. Las rutas sin uso tienen distancia, tiempo y carga cero.

`solver_status_code` conserva el código interno como diagnóstico. La interfaz no lo convierte por sí solo en una prueba de imposibilidad. `optimality_proven` es falso en el servicio; la referencia exacta se calcula solo en la evaluación pequeña.

## Errores

- **422:** campos inválidos, booleanos o cadenas en campos enteros, IDs repetidos, coordenadas fuera de rango, más de 30 pedidos o campos extra.
- **429:** otra optimización está en curso. Se admite una búsqueda a la vez para mantener previsible el uso local de CPU.
- **404 en benchmark:** falta el archivo; ejecuta `python -m app.evaluate`.

Un escenario imposible no es un error HTTP: devuelve **200** y el estado `proven_infeasible`. Es un resultado válido del análisis.

No se guardan escenarios enviados, no se consultan APIs externas y no se envían mensajes a conductores. La descarga del JSON ocurre en el navegador a petición del usuario. Para un despliegue real faltan autenticación y controles de servicio apropiados.
