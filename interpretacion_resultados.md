# Interpretación de Resultados: Optimización de Rutas (VRP)

Este documento detalla la justificación, interpretación y conclusiones extraídas de la evaluación comparativa realizada en el **Playground de Optimización** entre la solución de línea base y el modelo inteligente propuesto.

---

## 1. Contexto del Problema
El problema de Enrutamiento de Vehículos Capacitados (CVRP, por sus siglas en inglés) consiste en diseñar rutas óptimas para una flota de vehículos que debe satisfacer la demanda de un conjunto de clientes (puntos de entrega) partiendo de un almacén central, minimizando la distancia y el tiempo de recorrido sin exceder la capacidad de carga de los camiones.

Dada la explosión combinatoria de este problema (NP-Hard), calcular la ruta perfecta para cientos de puntos de manera simultánea es computacionalmente muy costoso.

---

## 2. Modelos Evaluados

### A. Línea Base (Puro OR-Tools)
- **Descripción:** Utiliza el solucionador clásico de restricciones (*Constraint Solver*) proporcionado por Google OR-Tools para calcular las rutas abordando **todos los puntos de entrega a la vez**.
- **Comportamiento visual:** En el mapa interactivo (trazado recto), a menudo se observa que las rutas se cruzan entre sí o que un vehículo viaja de un extremo de la ciudad a otro.
- **Ventaja:** Puede encontrar soluciones de alta calidad global si se le da suficiente tiempo de cómputo.
- **Desventaja:** Al incrementar la cantidad de puntos de entrega (ej: >50), el costo computacional (tiempo de inferencia en segundos) crece exponencialmente. Para entornos web en tiempo real, suele agotar el tiempo de espera (Timeout) o devolver soluciones subóptimas si se interrumpe temprano.

### B. Modelo Propuesto (K-Means + OR-Tools)
- **Descripción:** Es un enfoque heurístico híbrido o *Clustered VRP*. Primero, aplica Machine Learning No Supervisado (**K-Means**) para agrupar geográficamente los puntos de entrega en "sectores" basándose puramente en su cercanía espacial (coordenadas Lat/Lng). Luego, envía cada sector (cluster) de forma independiente al solucionador OR-Tools para encontrar la ruta de un solo vehículo.
- **Comportamiento visual:** En el mapa interactivo se aprecian polígonos o "manchas" de colores bien definidos. Los camiones no invaden los sectores de los demás, evitando cruces ineficientes por el centro de la ciudad.
- **Ventaja:** Divide y vencerás. El costo computacional disminuye drásticamente, permitiendo resolver escenarios de cientos de puntos en unos pocos segundos.
- **Desventaja:** La distancia total teórica podría ser ligeramente mayor que en la Línea Base, ya que la optimización es local por sector y no global, pero en la práctica industrial, esta sectorización es preferida por la facilidad de organización logística.

---

## 3. Interpretación de las Métricas del Tablero

Al ejecutar ambos modelos con la **misma Semilla (Seed)** y configuración (ej. 20 puntos, 3 vehículos), se deben interpretar tres métricas fundamentales:

1. **Costo Computacional (segundos):**
   - Es la métrica clave de esta evaluación. Se espera que el Modelo Propuesto (K-Means) arroje un costo computacional significativamente menor, especialmente a medida que aumenta el número de puntos de entrega.
   
2. **Distancia Total (km) y Tiempo de Reparto (min):**
   - Reflejan la calidad de la solución encontrada.
   - En escenarios pequeños, OR-Tools Puro ganará en distancia (menor kilometraje) porque analiza todo el espectro global. 
   - Sin embargo, en escenarios grandes restringidos por tiempo de cómputo (ej. límite de 5 segundos), OR-Tools Puro no tendrá tiempo de refinar la solución y podría devolver distancias peores que K-Means, demostrando la superioridad del enfoque híbrido en tiempo real.

3. **Vehículos Activos:**
   - Ambos intentarán maximizar la utilización de los camiones disponibles para repartir la carga equilibradamente.

---

## 4. Conclusión para el Informe

La integración de **Machine Learning (K-Means)** previo a la optimización de restricciones (OR-Tools) demuestra ser una arquitectura altamente escalable para el diseño de rutas logísticas. 

Mientras que el solucionador clásico (Línea Base) lucha contra la complejidad temporal en escenarios del mundo real, la **sectorización inteligente** reduce exponencialmente la carga de trabajo del algoritmo de ruteo. Las visualizaciones geográficas confirman que este enfoque no solo es más rápido (reduciendo el costo computacional), sino que produce rutas logísticamente más intuitivas y organizadas por zonas, eliminando el traslapo ineficiente de flotas en el territorio. 

Esta solución cumple íntegramente con la necesidad de entregar respuestas en "tiempo real" para plataformas web corporativas, balanceando perfectamente el rendimiento del servidor con la eficacia logística operativa.
