# Código explicado para principiantes

## Conceptos previos

Una variable guarda un valor. Una lista guarda varios elementos en orden. Un diccionario asocia nombres con valores. Una función reúne pasos bajo un nombre. Cada archivo `.py` es un módulo. `python -m app.evaluate` ejecuta el módulo `evaluate.py` ubicado dentro de `app`.

Una ruta es una lista de IDs, por ejemplo `[3, 8, 2]`. El depósito se añade al calcular el recorrido: `D → 3 → 8 → 2 → D`. Una lista vacía representa un vehículo sin usar.

## Qué archivo leer primero

| Archivo | Responsabilidad |
|---|---|
| `app/schema.py` | Definir datos admitidos y rechazar entradas inválidas |
| `app/data.py` | Generar pedidos y escenarios con semillas fijas |
| `app/network.py` | Calcular distancias y tiempos |
| `app/validation.py` | Recalcular cada ruta y comprobar restricciones |
| `app/baseline.py` | Construir una referencia sencilla |
| `app/solver.py` | Declarar el problema a OR-Tools y comparar soluciones |
| `app/evaluate.py` | Ejecutar casos y una referencia exacta pequeña |
| `app/main.py` | Recibir solicitudes HTTP y devolver JSON |
| `frontend/index.html` | Organizar controles, mapa y textos |
| `frontend/styles.css` | Apariencia y distribución de la interfaz |
| `frontend/app.js` | Interacciones, dibujo del SVG y presentación de resultados |
| `run.py` | Encender el servidor local |

## Seguir un pedido

1. `Order` comprueba su ID, coordenadas, cajas y servicio.
2. `nodes_for` lo agrega a una lista que empieza por el depósito.
3. `matrices` calcula cómo viajar entre todas las parejas de puntos.
4. `build_baseline` intenta asignarlo en el orden de entrada.
5. `solve_routes` permite que OR-Tools lo coloque en otra ruta y posición.
6. `validate_plan` comprueba que aparezca exactamente una vez.
7. La API devuelve sus tiempos y la página lo dibuja en el mapa.

## La parte que resuelve OR-Tools

`RoutingIndexManager` traduce entre índices internos y nodos del problema. Un índice interno no es el ID del pedido: por eso se mantienen traducciones explícitas.

Un callback es una función que OR-Tools llama para preguntar un costo o una demanda. Aquí hay uno para distancia, uno para tiempo y otro para carga. Las dimensiones acumulan tiempo y capacidad a lo largo de cada ruta. El solver busca asignaciones válidas que reduzcan la distancia.

Los pesos de una red neuronal no aparecen en este proyecto. Las reglas del problema se declaran; el algoritmo busca una combinación de decisiones. Resolver otra jornada no entrena nada ni cambia lo aprendido para jornadas posteriores.

## Recálculo independiente

`route_details` empieza en el depósito con tiempo y distancia cero. Por cada pedido suma el viaje, registra llegada, suma descarga y registra salida. Finalmente añade el regreso. `validate_plan` revisa cobertura, repeticiones y límites, y calcula indicadores globales.

La validación independiente importa porque un error al traducir índices, olvidar el regreso o interpretar la capacidad podría producir un plan aparentemente razonable en el mapa y equivocado en los datos.

## Página y servidor

JavaScript envía el escenario como JSON a `/api/optimize`. FastAPI lo valida y ejecuta el cálculo. La respuesta trae escenario, referencia, solución, diagnósticos y métricas. La página crea rutas SVG y tablas a partir de esa respuesta.

Cambiar un control borra los resultados anteriores. El botón de descarga guarda el JSON en el navegador; la aplicación no almacena los escenarios recibidos. Los textos dinámicos usan `textContent` para mostrarse como texto.

## Ejercicios pequeños

- Cambia un texto o color de la interfaz sin tocar el algoritmo.
- Modifica una capacidad y observa si el problema sigue siendo factible.
- Cambia la velocidad y comprueba cómo afecta al tiempo, aunque la matriz de distancias sea la misma.
- Sigue una ruta a mano y suma sus viajes y servicios.
- Compara el orden de entrada con el itinerario optimizado.

Para añadir ventanas horarias, tráfico o varios depósitos, hay que cambiar la formulación y las pruebas; no basta con agregar un campo a la pantalla.
