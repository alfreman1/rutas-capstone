import time
import math
import random
import uuid
from typing import Dict, List, Any
from pydantic import BaseModel

from src.domain.planificacion.distance_provider import DistanceMatrixProvider
from src.domain.models import Almacen, PuntoEntrega, Vehiculo, Pedido, DetallePedido
from src.infrastructure.optimization.routing.ortools_cvrp import ORToolsCVRPOptimizer

class DemoRequest(BaseModel):
    num_points: int
    num_vehicles: int
    algorithm: str = "OR_TOOLS"
    seed: int = 42

class HaversineDistanceProvider(DistanceMatrixProvider):
    def __init__(self, locations: Dict[str, dict]):
        self.locations = locations

    def _haversine(self, lat1, lon1, lat2, lon2):
        R = 6371e3 # metres
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)

        a = math.sin(delta_phi / 2.0) ** 2 + \
            math.cos(phi1) * math.cos(phi2) * \
            math.sin(delta_lambda / 2.0) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        return R * c

    def distancia(self, origin_id: str, dest_id: str) -> float:
        orig = self.locations[origin_id]
        dest = self.locations[dest_id]
        return self._haversine(orig['lat'], orig['lng'], dest['lat'], dest['lng'])

    def tiempo(self, origin_id: str, dest_id: str) -> float:
        # Assuming 40km/h average speed -> ~11.1 m/s
        dist_m = self.distancia(origin_id, dest_id)
        return dist_m / 11.1

    def get_distance_matrix(self) -> Dict[str, Dict[str, float]]:
        return {}
    def get_time_matrix(self) -> Dict[str, Dict[str, float]]:
        return {}


from src.infrastructure.optimization.sectorization.kmeans_sectorizer import KMeansSectorizer

def optimize_synthetic_journey(num_points: int = 20, num_vehicles: int = 3, algorithm: str = "OR_TOOLS", seed: int = 42):
    start_time = time.time()
    
    random.seed(seed)
    
    # 1. Crear Almacen (Sucre Centro aprox)
    almacen_id = "ALMACEN-SUCRE"
    almacen = Almacen(
        id=almacen_id, codigo="ALM-01", nombre="Almacen Central",
        latitud=-19.03332, longitud=-65.26274, capacidad=100000.0
    )
    locations = {almacen_id: {'lat': almacen.latitud, 'lng': almacen.longitud}}
    
    # 2. Crear Vehículos (Hino)
    vehiculos = []
    for i in range(num_vehicles):
        v_id = f"VEH-{i+1}"
        vehiculos.append(Vehiculo(
            id=v_id, codigo=v_id, capacidad_peso=5000.0, # 5 toneladas
            capacidad_volumen=20.0, capacidad_cajas=300.0
        ))
        
    # 3. Crear Puntos y Pedidos
    puntos = []
    pedidos = []
    
    for i in range(num_points):
        p_id = f"PUNTO-{i+1}"
        lat = almacen.latitud + random.uniform(-0.05, 0.05)
        lng = almacen.longitud + random.uniform(-0.05, 0.05)
        
        punto = PuntoEntrega(
            id=p_id, codigo=p_id, nombre=f"Cliente {i+1}",
            latitud=lat, longitud=lng
        )
        puntos.append(punto)
        locations[p_id] = {'lat': lat, 'lng': lng}
        
        pedido = Pedido(
            id=f"PED-{i+1}", jornada_id="JOR-DEMO", contrato_id="CON-DEMO",
            punto_entrega_id=p_id, detalles=[
                DetallePedido(pedido_id=f"PED-{i+1}", producto_id="PROD-1", cantidad=1.0, peso_total=random.uniform(50.0, 500.0))
            ]
        )
        pedidos.append(pedido)

    distance_provider = HaversineDistanceProvider(locations)
    optimizer = ORToolsCVRPOptimizer(distance_provider=distance_provider, time_limit_seconds=5)
    
    resultado = None
    
    # K-Means + OR-Tools Logic
    if algorithm == "KMEANS_ORTOOLS" and num_vehicles > 1 and num_points > num_vehicles:
        sectorizer = KMeansSectorizer()
        puntos_dict = [{"id": p.id, "latitud": p.latitud, "longitud": p.longitud} for p in puntos]
        sectores = sectorizer.agrupar(puntos_dict, {"n_sectores": num_vehicles})
        
        rutas_totales = []
        vehiculos_usados = 0
        distancia_total = 0.0
        tiempo_total = 0.0
        
        # Enviar cada sector al optimizador con 1 solo vehículo
        for cluster_id, puntos_ids in sectores.items():
            if vehiculos_usados >= len(vehiculos):
                break
            
            vehiculo_asignado = [vehiculos[vehiculos_usados]]
            puntos_cluster = [p for p in puntos if p.id in puntos_ids]
            pedidos_cluster = [p for p in pedidos if p.punto_entrega_id in puntos_ids]
            
            res_parcial = optimizer.optimize(almacen=almacen, puntos=puntos_cluster, pedidos=pedidos_cluster, vehiculos=vehiculo_asignado)
            if "routes" in res_parcial:
                rutas_totales.extend(res_parcial["routes"])
                distancia_total += res_parcial.get("metrics", {}).get("distanceTotalKm", 0)
                tiempo_total += res_parcial.get("metrics", {}).get("timeTotalMin", 0)
                vehiculos_usados += res_parcial.get("metrics", {}).get("vehiclesUsed", 1)
                
        resultado = {
            "status": "SUCCESS",
            "algorithm": {
                "clustering": "KMEANS",
                "routing": "OR_TOOLS_CVRP"
            },
            "metrics": {
                "distanceTotalKm": round(distancia_total, 2),
                "timeTotalMin": round(tiempo_total, 2),
                "vehiclesUsed": vehiculos_usados
            },
            "routes": rutas_totales
        }
    else:
        # Global OR-Tools
        resultado = optimizer.optimize(almacen=almacen, puntos=puntos, pedidos=pedidos, vehiculos=vehiculos)
    
    end_time = time.time()
    
    return {
        "status": "COMPLETADA" if resultado and "routes" in resultado else "ERROR",
        "resultado": resultado,
        "tiempo_computo_segundos": round(end_time - start_time, 2),
        "algoritmo_usado": algorithm,
        "semilla": seed
    }
