import time
from typing import List, Dict, Any
from src.domain.models import Jornada, Almacen, Pedido, PuntoEntrega, Vehiculo
from src.domain.planificacion.distance_provider import DistanceMatrixProvider
from src.domain.optimizacion.sectorizador import Sectorizador
from src.infrastructure.optimization.routing.ortools_cvrp import ORToolsCVRPOptimizer

class OptimizarJornadaUseCase:
    def __init__(self, 
                 sectorizador: Sectorizador, 
                 distance_provider: DistanceMatrixProvider,
                 optimizer_time_limit: int = 5):
        self.sectorizador = sectorizador
        self.distance_provider = distance_provider
        self.optimizer_time_limit = optimizer_time_limit

    def execute(self, 
                jornada: Jornada, 
                almacen: Almacen,
                puntos: List[PuntoEntrega], 
                pedidos: List[Pedido], 
                vehiculos: List[Vehiculo],
                parametros_sectorizacion: Dict[str, Any]) -> Dict[str, Any]:
        
        start_time = time.time()
        
        # 1. Sectorización (Agrupar puntos de entrega)
        # Convertimos los puntos a diccionarios requeridos por el sectorizador
        puntos_dict = [{"id": p.id, "latitud": p.latitud, "longitud": p.longitud} for p in puntos]
        sectores_map = self.sectorizador.agrupar(puntos_dict, parametros_sectorizacion)
        
        # 2. Ruteo por Sector
        resultados_sectores = []
        vehiculos_disponibles = list(vehiculos) # Copia de la lista
        
        for sector_id, puntos_ids in sectores_map.items():
            # Filtramos puntos y pedidos del sector
            puntos_sector = [p for p in puntos if p.id in puntos_ids]
            pedidos_sector = [p for p in pedidos if p.punto_entrega_id in puntos_ids]
            
            # Asignación naive de vehículos: 
            # En un entorno real, habría una etapa de asignación más inteligente.
            # Aquí le damos una cantidad de vehículos al sector
            # (Ej: 1 o 2 vehículos por sector dependiendo del tamaño)
            vehiculos_sector = []
            if vehiculos_disponibles:
                vehiculos_sector.append(vehiculos_disponibles.pop(0))
                # Si hay muchos puntos, podríamos darle otro (simplificación)
                if len(puntos_sector) > 10 and vehiculos_disponibles:
                    vehiculos_sector.append(vehiculos_disponibles.pop(0))
            
            if not vehiculos_sector:
                # No hay vehículos para este sector
                resultados_sectores.append({
                    "sector_id": sector_id,
                    "status": "NO_VEHICLES_AVAILABLE"
                })
                continue
                
            # Ejecutar OR-Tools CVRP
            optimizer = ORToolsCVRPOptimizer(self.distance_provider, self.optimizer_time_limit)
            resultado_ruteo = optimizer.optimize(
                almacen=almacen,
                puntos=puntos_sector,
                pedidos=pedidos_sector,
                vehiculos=vehiculos_sector
            )
            
            resultados_sectores.append({
                "sector_id": sector_id,
                "ruteo": resultado_ruteo
            })
            
        end_time = time.time()
        
        # 3. Compilar métricas finales
        distancia_total = 0
        vehiculos_usados = 0
        
        for r in resultados_sectores:
            ruteo = r.get("ruteo", {})
            if ruteo.get("status") == "SUCCESS":
                distancia_total += ruteo.get("distancia_total_metros", 0)
                # Contar vehículos que realmente tuvieron asignaciones (>2 nodos porque incluye inicio y fin)
                for ruta in ruteo.get("rutas", []):
                    if len(ruta["paradas"]) > 2:
                        vehiculos_usados += 1
                        
        return {
            "jornada_id": jornada.id,
            "distancia_total_km": distancia_total / 1000.0,
            "vehiculos_utilizados": vehiculos_usados,
            "tiempo_computo_segundos": round(end_time - start_time, 2),
            "sectores": resultados_sectores
        }
