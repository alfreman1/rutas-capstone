# LogiRoute - Capa de Inteligencia Artificial y Optimización

Este servicio es un microservicio especializado desarrollado en **FastAPI + Python**. Su único objetivo es resolver problemas matemáticos complejos y devolver los resultados a la API principal (NestJS).

## Responsabilidades (Bounded Contexts)

1. **Preprocesamiento de Datos:**
   Limpieza y consolidación de la demanda por producto, validación FEFO y cubicaje de carga (cajas, peso, volumen).
2. **Sectorización (Clustering):**
   Utilizando algoritmos como K-Means y DBSCAN para la agrupación geográfica de los puntos de entrega considerando capacidad de vehículos.
3. **Consolidación de Carga:**
   Validación estricta de peso/volumen para asignación preliminar de vehículos.
4. **Optimización de Rutas (VRP/VRPTW):**
   Uso de Google OR-Tools para resolver el Vehicle Routing Problem considerando restricciones contractuales (ventanas horarias y tiempo de servicio).
5. **Métricas y Resultados:**
   Devolución de la ruta óptima ordenada y porcentaje de mejora.

## Arquitectura

Sigue principios de **Domain-Driven Design (DDD)** para aislar los algoritmos de infraestructura y endpoints:

- `api/`: Controladores FastAPI (endpoints HTTP).
- `application/`: Casos de uso (Orquestación del solver).
- `domain/`: Interfaces, entidades de dominio (Nodos, Matrices).
- `infrastructure/`: Implementaciones de OR-Tools o Scikit-learn.

## Comunicación con NestJS

NestJS enviará los datos necesarios (puntos, demanda y vehículos disponibles) a un endpoint como `POST /api/v1/optimization/routes`. FastAPI encolará el trabajo, devolverá un ID de tarea, y NestJS recuperará la solución cuando esté completada, manteniendo la aplicación rápida y asíncrona.

## Ejecución

```bash
# Crear entorno virtual
python -m venv .venv
source .venv/bin/activate # (o .venv\Scripts\activate en Windows)

# Instalar dependencias (FastAPI, Uvicorn, OR-Tools, scikit-learn)
pip install -r requirements.txt

# Correr servidor (ejemplo genérico, ajustar según main.py real)
uvicorn src.main:app --reload --port 8000
```

python -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload

.\.venv\Scripts\python.exe -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload
