# Nexo · Optimización de rutas de reparto

Ejemplo educativo completo de distribución urbana: pedidos sintéticos, restricciones, línea base, optimizador, validación independiente, backend y frontend. El código está en inglés; la interfaz y las guías están en español. No contiene nombres de alumnos ni direcciones personales.

## El contexto

Una distribuidora sale de un depósito para entregar cajas. Tiene varios vehículos iguales, cada uno con capacidad limitada y una duración máxima de recorrido. Hay que decidir qué vehículo atiende cada pedido y en qué orden.

Cada pedido es indivisible y debe atenderse exactamente una vez. Cada vehículo realiza un solo viaje, empieza en el depósito y regresa a él. Puede haber vehículos sin usar. El objetivo es **minimizar la distancia total**, respetando capacidad y duración máxima.

Este caso es **optimización combinatoria**, no clasificación ni predicción. No se entrena un modelo y no corresponde medir accuracy o F1. El modelo matemático representa decisiones, restricciones y una función objetivo.

## Abrir el ejemplo

Requisito: Python 3.12. Descomprime el ZIP, abre una terminal dentro de `route-optimization-demo` y ejecuta una línea a la vez.

macOS / Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-lock.txt
python run.py
```

Windows PowerShell:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-lock.txt
.\.venv\Scripts\python.exe run.py
```

Abre **http://127.0.0.1:9000**. Mantén la terminal abierta; `Ctrl+C` detiene el servidor. Para cambiar el puerto: `python run.py --port 9001`.

No necesita GPU, claves de API, servicios de mapas ni descargas de modelos. La instalación de las bibliotecas requiere Internet; después el cálculo y el mapa funcionan localmente. Se verificó con Python 3.12 en macOS Apple Silicon. Los comandos para Windows/Linux son una guía, no una verificación en esos sistemas.

## Qué probar

1. Abre **Jornada habitual**: se calcula el plan al iniciar.
2. Cambia entre **Inicial** y **Optimizado** para comparar los recorridos.
3. Filtra por vehículo y selecciona pedidos en el mapa.
4. Lee la secuencia y despliega las llegadas y descargas.
5. Cambia capacidad, vehículos, turno o velocidad y vuelve a optimizar. El resultado anterior se invalida al cambiar condiciones.
6. Prueba **Capacidad insuficiente** y **Turno demasiado corto**.
7. Prueba **La regla inicial se atasca**: hay solución, aunque la regla sencilla deje pedidos fuera.
8. Genera otros pedidos con cantidad y semilla; después calcula sus rutas.
9. Descarga el resultado JSON para revisar todos los datos del experimento.

El mapa es una **cuadrícula ficticia**, no un mapa geográfico. Cada cuadra mide 500 metros. Los tramos se dibujan horizontalmente y luego verticalmente, coherentes con la distancia Manhattan utilizada. Varias rutas pueden superponerse; el filtro y el itinerario permiten distinguirlas. Los números identifican pedidos, no su orden de visita.

## Qué se implementó

| Componente | Implementación |
|---|---|
| Datos | Pedidos reproducibles con posición, carga y minutos de servicio |
| Referencia | Asignación por orden de entrada al primer vehículo donde cabe el pedido |
| Optimizador | OR-Tools Routing; búsqueda local guiada, máximo 2 segundos |
| Restricciones | Visita única, capacidad por vehículo, duración incluyendo regreso |
| Función objetivo | Suma de metros recorridos por toda la flota |
| Validación | Recálculo independiente de visitas, carga, distancia y tiempos |
| Backend | FastAPI, sin persistir los escenarios enviados |
| Frontend | HTML/CSS/JavaScript y SVG, sin framework ni servidor de mapas |

La regla inicial agrega un pedido al final del primer recorrido donde quepa; no cambia el orden ni reconsidera asignaciones anteriores. Puede fallar aunque el problema admita solución. OR-Tools recibe esa ruta como punto inicial cuando es completa. Si la búsqueda no consigue una alternativa mejor, se conserva la referencia válida.

## Resultados de la entrega

En **Jornada habitual** hay 18 pedidos, 61 cajas y tres vehículos de 24 cajas, con turno máximo de 150 minutos y velocidad de 30 km/h.

| Medida | Plan inicial | Plan optimizado guardado |
|---|---:|---:|
| Distancia total | 134 km | 58 km |
| Pedidos atendidos | 18/18 | 18/18 |
| Restricciones | Cumplidas | Cumplidas |

La reducción fue **56,7 %**. Es un resultado sobre datos y supuestos ficticios; no una promesa de ahorro real ni una prueba de óptimo global.

La evaluación contiene **11 escenarios**: nueve con plan completo y dos con contradicciones demostrables de capacidad o tiempo. Ocho permiten comparar dos planes completos; su ahorro porcentual medio fue **51,6 %**, promedio simple por caso. Un noveno caso tiene solución optimizada pero referencia incompleta, por lo que no se calcula ahorro.

Para el caso de cinco entregas y un vehículo, se enumeraron las 120 secuencias: la distancia mínima fue **33 km** y la solución encontrada coincidió con ella. Esta comprobación exacta se aplica a ese caso pequeño, no a los demás.

Resultados completos: [benchmark.json](artifacts/benchmark.json) y [resumen de evaluación](artifacts/evaluation.md). La búsqueda tiene límite de tiempo real: otra ejecución o equipo puede producir rutas diferentes. El orden simétrico de algunas rutas tampoco es único.

## Reproducir datos y evaluación

Con el entorno activado:

```bash
python -m app.data
python -m app.evaluate
python -m pytest -q
python run.py
```

`app.data` guarda seis escenarios. `app.evaluate` ejecuta esos seis y cinco semillas adicionales, verifica los planes y calcula la referencia exacta pequeña. Reemplaza `artifacts/benchmark.json`; no modifica parámetros para mejorar la evaluación. `run.py` no vuelve a ejecutar el benchmark en cada inicio.

No existe una partición entrenamiento/prueba porque no hay aprendizaje estadístico. Se utiliza una batería fija de escenarios, casos límite y comprobaciones de restricciones. Para comparar cambios del algoritmo, conserva escenarios, versiones, tiempo de búsqueda y hardware comparables.

## Archivos y documentación

```text
route-optimization-demo/
├── README.md
├── run.py
├── requirements.txt
├── requirements-lock.txt
├── app/                 # Datos, matrices, referencia, optimizador, API
├── frontend/            # Página, estilos e interacciones
├── data/scenarios.json
├── artifacts/           # Resultados y verificaciones
├── tests/
└── docs/
```

- [Datos y supuestos](docs/data.md)
- [Modelo de optimización y métricas](docs/methodology.md)
- [Código para principiantes](docs/code-guide.md)
- [API y validaciones](docs/api.md)
- [Guion de clase](docs/teaching-guide.md)
- [Verificación de la entrega](docs/verification.md)

## Límites importantes del ejemplo

Los vehículos salen juntos al minuto 0. La velocidad es constante. Cada servicio ocupa los minutos declarados. La duración incluye viaje, descarga y vuelta al depósito; no incluye descansos ni espera porque no se modelan ventanas horarias.

No incorpora calles reales, sentido único, tráfico, barreras, recogidas, entregas divididas, varios viajes, costos monetarios, prioridades ni ventanas de atención por cliente. El turno máximo **no es** una ventana horaria de cada pedido. Una aplicación real necesitaría datos y restricciones adicionales.

Si un control simple demuestra una contradicción, el estado es `proven_infeasible`. Si el solver no encuentra un plan, se muestra `no_solution_found`: eso no afirma que el problema sea imposible. Cuando hay un plan se muestra `feasible`, sin certificar el óptimo general.

## Solución de problemas

- **Página no disponible:** espera `Uvicorn running` y mantén abierta la terminal.
- **Puerto ocupado:** usa `--port 9001` y abre esa dirección.
- **Datos rechazados:** introduce enteros dentro de los límites de los campos. IDs duplicados y más de 30 pedidos se rechazan en la API.
- **No se encuentra plan:** revisa capacidad y duración. Aumentar recursos cambia el problema; aumentar el tiempo de búsqueda solo cambia el esfuerzo por resolverlo.
- **Evaluación no disponible:** ejecuta `python -m app.evaluate` y vuelve a abrir la página.

El servidor escucha solo en `127.0.0.1`, no tiene autenticación y está preparado para una demostración local, no para publicación pública.
