# Modelo, comparación y métricas

## Formulación

Es un problema de rutas de vehículos con capacidad y duración máxima. Las decisiones son la asignación de pedidos a vehículos y la secuencia de cada recorrido. El objetivo suma metros recorridos. Se exige atender cada pedido exactamente una vez, salir y volver al depósito, respetar carga y respetar tiempo.

La carga total asignada a un vehículo equivale a la cantidad que lleva al salir para completar esas entregas. La dimensión de capacidad de OR-Tools acumula demandas positivas para comprobar esa suma; no se presenta como una simulación física de carga restante.

La duración por arco suma el viaje y el servicio del nodo de origen. Así, el último arco incluye la descarga del último pedido y su viaje de regreso. El validador independiente suma viajes, llegadas y servicios en otro procedimiento y debe llegar al mismo resultado.

El uso de dimensiones de capacidad sigue el ejemplo oficial de [CVRP de OR-Tools](https://developers.google.com/optimization/routing/cvrp). No se añaden disyunciones ni penalizaciones para permitir abandonar entregas: todas son obligatorias.

## Línea base

En el orden recibido, cada pedido se agrega al final del recorrido del primer vehículo donde siga siendo factible. Se verifica también la vuelta al depósito. Si no cabe en ninguno, queda sin asignar. La regla continúa con los siguientes pedidos, pero el resultado global será incompleto si faltó alguno.

No se debe sumar solo el costo de esa parte y presentarla como solución del problema completo. Por eso el porcentaje de ahorro está ausente cuando la referencia no atiende todos los pedidos.

## Búsqueda

Si la referencia es completa, se entrega al solver como solución inicial mediante `ReadAssignmentFromRoutes` y `SolveFromAssignmentWithParameters`, siguiendo el mecanismo de [rutas iniciales](https://developers.google.com/optimization/routing/routing_tasks). Si no lo es, se solicita una primera solución mediante `PATH_CHEAPEST_ARC`.

La búsqueda utiliza `GUIDED_LOCAL_SEARCH` con dos segundos como límite. Las [opciones oficiales de búsqueda](https://developers.google.com/optimization/routing/routing_options) describen estos controles. El tiempo total de API añade preparación y validación, por lo que puede superar ligeramente dos segundos.

La solución puede cambiar según hardware, carga de la máquina o versión. Si el solver falla o devuelve un plan más largo y existe una referencia completa, la aplicación conserva la referencia y lo declara con `solution_source = baseline_retained`. Por eso el plan seleccionado nunca es peor que una referencia completa; no implica que OR-Tools garantice mejorarla en cualquier caso.

## Estados y pruebas de imposibilidad

- `proven_infeasible`: la demanda total supera la capacidad total, un pedido no cabe en ningún vehículo o una entrega sola excede la duración permitida contando ida, servicio y regreso. Son contradicciones suficientes para descartar el escenario bajo estos supuestos.
- `no_solution_found`: no hubo un plan y no existe una de esas demostraciones simples. No se afirma imposibilidad, incluso si el código interno del solver indica fracaso.
- `feasible`: se obtuvo y verificó un plan completo, procedente del solver o de la referencia conservada.

Las comprobaciones simples no caracterizan toda la factibilidad. Tres pedidos de seis cajas y dos vehículos de diez suman 18 ≤ 20, pero no pueden distribuirse sin dividir pedidos. El ejemplo prueba que el chequeo de capacidad total por sí solo no garantiza solución.

## Indicadores

| Indicador | Interpretación |
|---|---|
| Factibilidad | Todos los pedidos una vez y todas las restricciones satisfechas |
| Distancia total | Suma de metros de todos los vehículos; objetivo a minimizar |
| Ahorro absoluto | Distancia inicial menos distancia seleccionada, solo con ambos planes completos |
| Ahorro porcentual | Ahorro absoluto / distancia inicial × 100 |
| Duración total | Suma de duraciones; no es el instante de fin de la jornada |
| Último regreso | Máxima duración de ruta si todos salen simultáneamente |
| Vehículos usados | Rutas con al menos un pedido |
| Carga por vehículo | Cajas asignadas frente a su capacidad |
| Tiempo de cálculo | Costo computacional observado de resolver y validar |

No se optimizan directamente balance de carga, cantidad de vehículos ni último regreso. Es posible mejorar el objetivo y empeorar otra medida. No se estiman combustible, emisiones o dinero porque no se incorporaron datos para ello.

## Evaluación

Se ejecutan seis escenarios de demostración y cinco semillas adicionales, con el mismo límite de búsqueda. No son conjuntos de entrenamiento y prueba: el solver no aprende de esas ejecuciones. Se incluyen casos factibles, contradicciones de recursos, una regla voraz que falla y un problema pequeño enumerado exactamente.

El caso pequeño tiene un vehículo y cinco paradas. Evaluamos las 5! = 120 permutaciones y conservamos la menor distancia factible. Encontrar 33 km tanto con enumeración como con el solver confirma la coincidencia con el óptimo de ese caso. El campo general `optimality_proven` permanece falso: el servicio no calcula certificados de optimalidad para escenarios arbitrarios.

Para comparar cambios del algoritmo, conserva la batería y registra versión, tiempo de búsqueda y máquina. Repetir escenarios y medir dispersión es un siguiente paso; la entrega contiene una ejecución guardada de cada caso, no una distribución de rendimiento.
