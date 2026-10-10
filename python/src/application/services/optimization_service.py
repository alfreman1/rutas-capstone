import time
import math
from typing import Dict, Any, List

from src.api.schemas import OptimizacionRequest
from src.domain.optimizacion.sectorizador import Sectorizador
from src.infrastructure.optimization.sectorization.kmeans_sectorizer import KMeansSectorizer
from src.infrastructure.optimization.sectorization.dbscan_sectorizer import DBSCANSectorizer
from src.infrastructure.optimization.routing.ortools_cvrp import ORToolsCVRPOptimizer
from src.domain.models import Almacen, PuntoEntrega, Vehiculo, Pedido, DetallePedido
from src.domain.planificacion.distance_provider import DistanceMatrixProvider

class RequestDistanceProvider(DistanceMatrixProvider):
    def __init__(self, locations: Dict[str, dict]):
        self.locations = locations

    def _haversine(self, lat1, lon1, lat2, lon2):
        R = 6371e3
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
        dist_m = self.distancia(origin_id, dest_id)
        return dist_m / 11.1

    def get_distance_matrix(self) -> Dict[str, Dict[str, float]]:
        return {}
    def get_time_matrix(self) -> Dict[str, Dict[str, float]]:
        return {}


_jobs_db: Dict[str, Any] = {}

def create_job(job_id: str, request_data: OptimizacionRequest):
    _jobs_db[job_id] = {
        "job_id": job_id,
        "status": "PROCESANDO",
        "result": None,
        "request": request_data,
        "created_at": time.time()
    }

def get_job(job_id: str) -> Any:
    job = _jobs_db.get(job_id)
    if job:
        # Don't return the full request to the client
        return {
            "job_id": job["job_id"],
            "status": job["status"],
            "result": job["result"]
        }
    return None

def process_vrp_job(job_id: str):
    """
    Proceso pesado real: 
    1. Armar matriz de distancias (OSRM / Haversine)
    2. K-Means / DBSCAN para clústeres preliminares
    3. Google OR-Tools para VRPTW
    """
    job = _jobs_db.get(job_id)
    if not job:
        return
        
    request: OptimizacionRequest = job["request"]
    start_time = time.time()
    
    try:
        # 1. Mapeo a Modelos de Dominio (Almacen)
        # Asumiremos que el primer punto de entrega o un almacén fijo es el depósito
        # Para simplificar, tomamos el centro de Sucre como almacén por defecto o un punto medio
        almacen = Almacen(
            id="ALM-VIRTUAL", codigo="ALM-00", nombre="Almacen Virtual",
            latitud=-19.03332, longitud=-65.26274, capacidad=100000.0
        )
        
        locations = {almacen.id: {'lat': almacen.latitud, 'lng': almacen.longitud}}
        
        # Puntos y Pedidos
        puntos_dominio: List[PuntoEntrega] = []
        pedidos_dominio: List[Pedido] = []
        puntos_para_sectorizar = []
        
        for p in request.puntosEntrega:
            pd = PuntoEntrega(
                id=p.id, codigo=p.id, nombre=p.id,
                latitud=p.latitud, longitud=p.longitud
            )
            puntos_dominio.append(pd)
            locations[p.id] = {'lat': p.latitud, 'lng': p.longitud}
            puntos_para_sectorizar.append({
                'id': p.id, 'latitud': p.latitud, 'longitud': p.longitud
            })
            
            # Sumar demanda
            peso_total = sum(d.pesoTotal for d in p.demandas) if p.demandas else 0.0
            pedidos_dominio.append(Pedido(
                id=f"PED-{p.id}", jornada_id=request.jornadaId, contrato_id="CON-VIRTUAL",
                punto_entrega_id=p.id, detalles=[
                    DetallePedido(pedido_id=f"PED-{p.id}", producto_id="PROD", cantidad=1.0, peso_total=peso_total)
                ]
            ))
            
        # Vehículos
        vehiculos_dominio: List[Vehiculo] = []
        for v in request.vehiculos:
            vehiculos_dominio.append(Vehiculo(
                id=v.id, codigo=v.id, capacidad_peso=v.capacidadPesoKg,
                capacidad_volumen=v.capacidadVolumenM3, capacidad_cajas=999.0
            ))
            
        # 2. Sectorización
        # Seleccionamos la estrategia según la petición del cliente (Vue -> NestJS -> FastAPI)
        algoritmo = getattr(request, 'algoritmo', 'KMEANS_ORTOOLS')
        
        n_sectores = len(vehiculos_dominio)
        sectores = {}
        
        if algoritmo == 'KMEANS_ORTOOLS' and n_sectores > 0 and len(puntos_para_sectorizar) > 0:
            sectorizador = KMeansSectorizer()
            sectores = sectorizador.agrupar(puntos_para_sectorizar, {'n_sectores': n_sectores})
        elif algoritmo == 'DBSCAN_ORTOOLS' and len(puntos_para_sectorizar) > 0:
            sectorizador = DBSCANSectorizer()
            # eps = 0.05 es un estimado para lat/lng en Bolivia para unos 5km
            sectores = sectorizador.agrupar(puntos_para_sectorizar, {'eps': 0.05, 'min_samples': 3})
        else:
            # Estrategia "PURE_ORTOOLS" o fallback (todo el dataset como un solo bloque)
            sectores = {0: [p['id'] for p in puntos_para_sectorizar]}
            
        # 3. Optimización con OR-Tools (por ahora global, pero agrupado lógicamente o todo de una vez)
        # En una arquitectura avanzada OR-Tools correría *por sector*
        # Por ahora enviamos todo al motor general que usa los vehículos que definimos
        distance_provider = RequestDistanceProvider(locations)
        optimizer = ORToolsCVRPOptimizer(distance_provider=distance_provider, time_limit_seconds=5)
        
        resultado = optimizer.optimize(
            almacen=almacen, 
            puntos=puntos_dominio, 
            pedidos=pedidos_dominio, 
            vehiculos=vehiculos_dominio
        )
        
        end_time = time.time()
        
        # Format the result to match the frontend expectations (Vue / NestJS)
        formatted_result = {
            "distanciaTotalKm": round(resultado.get("distancia_total_metros", 0) / 1000, 2),
            "tiempoTotalMinutos": round(resultado.get("distancia_total_metros", 0) / 1000 / 30 * 60), # Approx 30km/h
            "vehiculosUtilizados": len([r for r in resultado.get("rutas", []) if len(r.get("paradas", [])) > 2]),
            "rutas": []
        }
        
        for ruta in resultado.get("rutas", []):
            paradas = ruta.get("paradas", [])
            # Ignore empty routes (only warehouse to warehouse)
            if len(paradas) <= 2:
                continue
                
            formatted_ruta = {
                "vehiculoId": ruta.get("vehiculo_id"),
                "distanciaKm": round(ruta.get("distancia_metros", 0) / 1000, 2),
                "entregas": []
            }
            
            orden = 1
            for parada_id in paradas:
                if parada_id != almacen.id:
                    loc = locations.get(parada_id, {'lat': 0, 'lng': 0})
                    formatted_ruta["entregas"].append({
                        "orden": orden,
                        "puntoEntregaId": parada_id,
                        "latitud": loc['lat'],
                        "longitud": loc['lng']
                    })
                    orden += 1
                    
            formatted_result["rutas"].append(formatted_ruta)
        
        # 4. Actualizar Job
        _jobs_db[job_id]["status"] = "COMPLETADA" if "rutas" in resultado else "ERROR"
        _jobs_db[job_id]["result"] = formatted_result
        _jobs_db[job_id]["tiempo_computo_segundos"] = round(end_time - start_time, 2)
        _jobs_db[job_id]["sectores_generados"] = sectores # Para reportería
        
    except Exception as e:
        _jobs_db[job_id]["status"] = "ERROR"
        _jobs_db[job_id]["result"] = {"error_detail": str(e)}
