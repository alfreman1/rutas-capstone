# Guion de clase: reparto con restricciones

Duración orientativa: 60–75 minutos. Instala las dependencias e inicia el servidor antes de comenzar.

## 1. Formular el objetivo — 10 minutos

Presenta un depósito, varios pedidos y vehículos. Pide distinguir decisiones de datos: la carga es un dato; qué vehículo atiende cada pedido es una decisión. Define la distancia total como objetivo y capacidad/duración como restricciones.

Aclara que no hay entrenamiento. El solver busca un plan para los datos de la jornada; no aprende de entregas pasadas.

## 2. Leer la referencia — 10 minutos

Abre Jornada habitual y selecciona Inicial. Revisa una secuencia. La regla respeta el orden de entrada y asigna al primer vehículo disponible. No conoce una agrupación geográfica conveniente de antemano.

Compara con Optimizado. La ejecución guardada pasó de 134 a 58 km sin eliminar pedidos. Pide comprobar que cada plan atiende 18/18 y respeta límites antes de interpretar el ahorro.

## 3. Leer tiempos y capacidades — 10 minutos

Filtra por vehículo y abre sus llegadas/descargas. Suma una ruta desde la salida al regreso. Explica por qué «último regreso» es el máximo de las duraciones y no la suma cuando los vehículos parten juntos.

No confundas capacidad de un vehículo con capacidad total. Tampoco confundas turno máximo con una ventana de atención del cliente.

## 4. Provocar problemas — 15 minutos

Selecciona Capacidad insuficiente: compara cajas requeridas con las que admite la flota. Selecciona Turno demasiado corto: una entrega sola ya puede superar el límite con ida, descarga y regreso.

Después muestra La regla inicial se atasca. Las cargas 4,4,6,6 y dos vehículos de diez admiten 4+6 por vehículo. La regla inicial puede juntar 4+4 y quedarse sin espacio para completar todo. Su fracaso no prueba que el problema sea imposible.

Observa que en ese caso no aparece porcentaje de ahorro. Un recorrido parcial de 7 km no es mejor solución que uno completo de 9 km si el primero deja entregas sin hacer.

## 5. Verificar el algoritmo — 10 minutos

Abre Evaluar. Revisa los 11 casos y la referencia pequeña de cinco pedidos. Hay 120 secuencias posibles con un vehículo; se pueden enumerar y comparar. Para muchos pedidos, esa enumeración crece rápidamente.

Explica «solución factible», «mejor solución encontrada» y «óptimo demostrado». Encontrar una ruta más corta no demuestra que no exista otra aún mejor.

## 6. Experimentar y transferir — 10 minutos

Genera pedidos con otra semilla. Cambia una condición a la vez, vuelve a resolver y descarga el JSON. Pide justificar si el cambio afecta al problema o al esfuerzo de búsqueda.

Se puede reutilizar el procedimiento para visitas técnicas, distribución de productos o recolección, pero el último caso requiere adaptar las reglas de carga. Ventanas horarias, varios viajes y tráfico no están implementados; deben modelarse y comprobarse explícitamente.

## Actividad de cierre

Entrega tres resultados: una ruta corta incompleta, una completa con sobrecarga y una completa válida más larga. Pide seleccionar cuál es solución del problema y explicar por qué. La respuesta debe priorizar factibilidad antes de comparar kilómetros.
