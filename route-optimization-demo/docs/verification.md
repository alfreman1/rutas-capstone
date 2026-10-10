# Verificación de la entrega

## Ejecuciones reales

Se instaló OR-Tools 9.15.6755, se generaron seis escenarios y se ejecutó una batería de 11 casos con búsqueda limitada a dos segundos. Nueve produjeron planes completos verificados; dos se descartaron por contradicciones de capacidad o duración.

El escenario habitual pasó de 134 a 58 km en la ejecución guardada, atendiendo los 18 pedidos y cumpliendo las restricciones. El caso pequeño coincidió con la referencia exacta de 33 km calculada sobre las 120 permutaciones. Todos los resultados, tiempos y escenarios están en `artifacts/benchmark.json`.

## Pruebas automáticas

`python -m pytest -q`: **38 pruebas correctas**. Cubren distancias y tiempos calculados a mano, regreso al depósito, servicio, rutas vacías, redondeo, reproducibilidad, validación de entrada, IDs duplicados, capacidad y tiempo, pedidos faltantes/repetidos, estados de búsqueda, referencia conservada, fracaso de la regla inicial, comparación exacta pequeña, IDs no consecutivos, puntos coincidentes, API y concurrencia.

Las pruebas de calidad de las rutas y la API emplean OR-Tools real. Dos pruebas sustituyen expresamente la búsqueda para simular su fracaso y comprobar el mensaje y la conservación de una referencia válida; no se cuentan como evidencia de calidad del solver.

La ejecución presentó cuatro avisos de deprecación: uno de Starlette/AnyIO y tres de los enlaces SWIG de OR-Tools. No impidieron completar las pruebas. `pip check` no detectó incompatibilidades. Se verificó la sintaxis de Python y JavaScript.

## Servicio y navegador

El servidor local se probó mediante solicitudes HTTP reales de jornada habitual, capacidad insuficiente y referencia voraz incompleta. Las respuestas se guardan en `artifacts/example_responses.json`; los planes disponibles se volvieron a comprobar con el validador.

En el navegador integrado se comprobó el cálculo de la jornada habitual, la selección de escenarios, la invalidación de resultados anteriores, el filtro por vehículo, la consulta de un pedido en el mapa, las llegadas/descargas y la comparación entre un plan inicial incompleto y uno optimizado completo. Se verificó que el caso de capacidad insuficiente muestra la contradicción de 61 cajas frente a 12 disponibles.

Se inspeccionó una captura de la interfaz. Los pedidos del SVG tienen controles etiquetados accesibles y se puede activar su consulta con clic o teclado. No se realizó una auditoría completa de accesibilidad ni una prueba en teléfonos físicos.

El panel de evaluación mostró los 11 escenarios, los ocho ahorros comparables y la coincidencia con la referencia exacta. También se comprobaron los recursos estáticos, identificadores y enlaces locales antes de empaquetar.

La verificación se realizó en macOS Apple Silicon. Las instrucciones para Windows/Linux no equivalen a haber ejecutado el proyecto en esos sistemas. Las rutas y el tiempo de cálculo pueden variar al repetir una búsqueda limitada por tiempo real.
