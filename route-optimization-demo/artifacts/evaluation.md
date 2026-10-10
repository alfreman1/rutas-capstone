# Evaluación de rutas

Versión de OR-Tools: 9.15.6755. Límite de búsqueda: 2 segundos por caso.

| Caso | Inicial completo km | Optimizado km | Ahorro | Estado |
|---|---:|---:|---:|---|
| regular | 134.0 | 58.0 | 56.7 % | feasible |
| busy | 139.0 | 69.0 | 50.4 % | feasible |
| shortage | Incompleto | — | No comparable | proven_infeasible |
| tight | Incompleto | — | No comparable | proven_infeasible |
| small | 35.0 | 33.0 | 5.7 % | feasible |
| greedy_trap | Incompleto | 9.0 | No comparable | feasible |
| seed-7 | 144.0 | 52.0 | 63.9 % | feasible |
| seed-19 | 143.0 | 56.0 | 60.8 % | feasible |
| seed-61 | 134.0 | 60.0 | 55.2 % | feasible |
| seed-88 | 150.0 | 57.0 | 62.0 % | feasible |
| seed-103 | 132.0 | 55.0 | 58.3 % | feasible |

El ahorro medio entre los ocho casos comparables es 51,6 %, promedio aritmético por escenario. No es un ahorro ponderado por kilómetros ni una estimación para una operación real.

La referencia de cinco entregas enumera las 120 secuencias y obtiene 33 km; el solver coincide con esa distancia. En los otros casos no se calculó una cota óptima ni un certificado.

El caso `greedy_trap` tiene cuatro pedidos y veinte cajas. El plan inicial recorre 7 km pero solo atiende tres pedidos. El optimizado recorre 9 km y atiende los cuatro. El dato parcial no se usa para calcular ahorro.

La batería utiliza escenarios sintéticos fijados y controles de factibilidad independientes. No hay entrenamiento ni ajustes con resultados de prueba. La búsqueda limitada por tiempo puede devolver secuencias o costos distintos al repetir la ejecución.

[Consultar todos los pedidos, rutas, cargas, tiempos y hashes](benchmark.json)
