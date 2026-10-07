# Proyecto de Optimización de Rutas (Sucre, Bolivia)

## 📌 Descripción General

Este proyecto es un sistema backend de optimización de rutas y logística enfocado en resolver problemas de enrutamiento de vehículos (VRP - Vehicle Routing Problem) con sectorización, diseñado inicialmente para operar con datos sintéticos de la ciudad de Sucre, Bolivia.

Está construido siguiendo los principios de **Arquitectura Limpia** (Clean Architecture), lo que permite una clara separación entre la lógica de negocio, los casos de uso, las integraciones externas (como la matriz de distancias) y la capa de exposición (API REST).

## 🚀 Funcionalidades Principales

### 1. Generación de Datos Sintéticos

- Capacidad para crear escenarios de prueba al vuelo (on-the-fly).
- Generación automática de un almacén central, puntos de entrega aleatorios (dentro del área de Sucre), vehículos disponibles y pedidos asociados.

### 2. Sectorización Inteligente

- Implementación de algoritmos de agrupamiento (Clustering) utilizando **K-Means** (`scikit-learn`).
- Agrupa los puntos de entrega en distintos sectores geográficos para balancear la carga de trabajo y asignar de manera más eficiente los vehículos a las distintas zonas antes de calcular la ruta exacta.

### 3. Optimización de Enrutamiento (VRP)

- Cálculo de las rutas más eficientes utilizando motores de optimización matemática (**Google OR-Tools**).
- Consideración de múltiples restricciones logísticas:
  - Número de vehículos disponibles.
  - Tiempos de computación máximos permitidos.
  - Puntos de inicio y fin (Almacén).
- Minimización de la distancia total recorrida y optimización de los vehículos utilizados.

### 4. Proveedor de Distancias Simulado

- Cálculo de distancias y tiempos de viaje estimados mediante un proveedor simulado (`SimulatedDistanceProvider`), asumiendo una velocidad promedio (ej. 30 km/h) entre coordenadas.

### 5. API RESTful

- Exposición de las funcionalidades a través de **FastAPI**.
- Endpoint principal para ejecutar todo el flujo (generación, sectorización y enrutamiento) en una sola llamada y devolver los resultados estructurados.

## 🏗️ Arquitectura y Tecnologías

El proyecto está estructurado en capas:

- **Domain:** Modelos de negocio (Almacén, Vehículos, Pedidos, Jornadas).
- **Application (Casos de Uso):** Lógica que orquesta las operaciones, como `OptimizarJornadaUseCase`.
- **Infrastructure:** Implementaciones concretas de interfaces (Generador sintético, Proveedor de distancias, Optimizador OR-Tools, Sectorizador K-Means).
- **API:** Controladores de FastAPI para recibir peticiones HTTP.

**Stack Tecnológico:**

- **Python 3+**
- **FastAPI & Uvicorn:** Para la API web rápida y moderna.
- **Pydantic:** Para validación de datos.
- **Scikit-learn:** Para la sectorización (K-Means).
- **Google OR-Tools:** Para resolver el problema de optimización de rutas (VRP).
- **NumPy & Pandas:** Para manejo de datos y matrices.

## 📋 Uso y Endpoints de Ejemplo

### Script de Prueba Local

El proyecto incluye un script `test_run.py` para probar la ejecución local rápida sin levantar la API completa:

```bash
python test_run.py
```

### Ejecutar la API

Para iniciar el servidor con Uvicorn (asegúrate de estar en la carpeta raíz del proyecto y tener las dependencias instaladas):

```bash
uvicorn src.api.main:app --reload

## en powershell
.\.venv\Scripts\uvicorn src.api.main:app --reload

```

### Endpoint Principal: `POST /optimization/journeys/synthetic`

Parámetros URL (Query):

- `num_points` (int): Cantidad de puntos de entrega a generar (ej. 20).
- `num_vehicles` (int): Cantidad de vehículos de reparto disponibles (ej. 3).
- `n_sectores` (int): En cuántas zonas dividir los puntos antes de rutear (ej. 2).

**Respuesta Esperada:**
JSON con el detalle de la jornada optimizada:

- Distancia Total (km).
- Cantidad de vehículos utilizados.
- Tiempo de cómputo.
- Detalle de la ruta de cada vehículo.
