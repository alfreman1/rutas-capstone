from typing import List, Dict, Any, Optional
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
from src.domain.planificacion.distance_provider import DistanceMatrixProvider
from src.domain.models import Vehiculo, PuntoEntrega, Almacen, Pedido
import math
from datetime import datetime, timedelta

class ORToolsCVRPOptimizer:
    def __init__(self, distance_provider: DistanceMatrixProvider, time_limit_seconds: int = 5):
        self.distance_provider = distance_provider
        self.time_limit_seconds = time_limit_seconds

    def optimize(self, 
                 almacen: Almacen, 
                 puntos: List[PuntoEntrega], 
                 pedidos: List[Pedido], 
                 vehiculos: List[Vehiculo]) -> Dict[str, Any]:
        """
        Resuelve el CVRP usando OR-Tools para un sector/conjunto de puntos.
        """
        if not puntos or not vehiculos:
            return {"status": "ERROR", "error_detail": "Sin puntos o vehículos para optimizar."}

        # 1. Preparar datos
        # Indexar pedidos por punto de entrega (simplificación: 1 pedido por punto)
        demandas_punto = {}
        for pedido in pedidos:
            demandas_punto[pedido.punto_entrega_id] = {
                'peso': pedido.peso_total,
                'volumen': pedido.volumen_total,
                'cajas': sum(getattr(d, 'cantidad_cajas', 0.0) for d in pedido.detalles)
            }
            
        # Nodos: Índice 0 es el almacén. Índices 1..N son los puntos.
        nodes = [almacen.id] + [p.id for p in puntos]
        # Mapa para recuperar entidad real por ID
        nodes_map = {almacen.id: almacen}
        for p in puntos:
            nodes_map[p.id] = p

        num_vehicles = len(vehiculos)
        depot_index = 0
        
        # Capacidades (usando peso como ejemplo primario para CVRP inicial)
        vehicle_capacities = [int(v.capacidad_peso) for v in vehiculos]
        
        # Demandas de los nodos
        demands = [0] # Depósito no tiene demanda
        for p in puntos:
            d = demandas_punto.get(p.id, {'peso': 0.0})
            demands.append(int(d['peso']))
            
        # 2. Funciones callback
        def distance_callback(from_index, to_index):
            # Convierte los índices internos de OR-Tools al índice de nodos
            from_node = nodes[manager.IndexToNode(from_index)]
            to_node = nodes[manager.IndexToNode(to_index)]
            # OR-Tools requiere enteros para la función objetivo
            return int(self.distance_provider.distancia(from_node, to_node))
            
        def demand_callback(from_index):
            from_node = manager.IndexToNode(from_index)
            return demands[from_node]

        # 3. Inicializar OR-Tools Manager y Routing Model
        manager = pywrapcp.RoutingIndexManager(len(nodes), num_vehicles, depot_index)
        routing = pywrapcp.RoutingModel(manager)
        
        # Registrar callback de distancias
        transit_callback_index = routing.RegisterTransitCallback(distance_callback)
        # Costo del arco (distancia)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
        
        # Registrar callback de capacidad (Peso)
        demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
        routing.AddDimensionWithVehicleCapacity(
            demand_callback_index,
            0,  # null capacity slack
            vehicle_capacities,  # vehicle maximum capacities
            True,  # start cumul to zero
            'Capacity'
        )
        
        # 4. Parámetros de búsqueda
        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)
        search_parameters.local_search_metaheuristic = (
            routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH)
        search_parameters.time_limit.FromSeconds(self.time_limit_seconds)
        
        # 5. Resolver
        solution = routing.SolveWithParameters(search_parameters)
        
        # 6. Formatear solución
        if solution:
            return self._format_solution(manager, routing, solution, nodes, nodes_map, demandas_punto, vehiculos)
        else:
            return {"status": "ERROR", "error_detail": "NO_SOLUTION_FOUND"}
            
    def _format_solution(self, manager, routing, solution, nodes, nodes_map, demandas_punto, vehiculos) -> Dict[str, Any]:
        """Extrae la solución en el formato DTO acordado."""
        routes = []
        total_distance_km = 0.0
        total_time_min = 0
        vehicles_used = 0
        
        # Tiempo base para estimaciones simples (08:00 AM)
        base_time = datetime.strptime("08:00", "%H:%M")
        
        for vehicle_id in range(routing.vehicles()):
            index = routing.Start(vehicle_id)
            
            route_distance_m = 0
            route_load_weight = 0
            route_load_volume = 0
            route_load_boxes = 0
            stops = []
            
            # Verificar si el vehiculo fue usado (si va del deposito a otro lado)
            if routing.IsEnd(solution.Value(routing.NextVar(index))):
                continue
            
            vehicles_used += 1
            order = 1
            current_time = base_time

            # Recorrer ruta (Omitimos el deposito inicial en los stops, o lo marcamos especial si queremos)
            while not routing.IsEnd(index):
                node_index = manager.IndexToNode(index)
                node_id = nodes[node_index]
                node_entity = nodes_map[node_id]
                
                # Si no es el deposito, agregamos como parada
                if node_index != 0:
                    d = demandas_punto.get(node_id, {'peso': 0.0, 'volumen': 0.0, 'cajas': 0.0})
                    route_load_weight += d['peso']
                    route_load_volume += d['volumen']
                    route_load_boxes += d['cajas']
                    
                    service_time = getattr(node_entity, 'tiempo_servicio', 15.0)
                    arrival_str = current_time.strftime("%H:%M")
                    current_time += timedelta(minutes=int(service_time))
                    departure_str = current_time.strftime("%H:%M")
                    
                    stops.append({
                        "pointId": node_id,
                        "latitud": float(node_entity.latitud),
                        "longitud": float(node_entity.longitud),
                        "order": order,
                        "estimatedArrival": arrival_str,
                        "estimatedDeparture": departure_str,
                        "serviceTimeMin": int(service_time)
                    })
                    order += 1
                
                previous_index = index
                index = solution.Value(routing.NextVar(index))
                
                # Distancia hacia el siguiente nodo
                arc_distance_m = routing.GetArcCostForVehicle(previous_index, index, vehicle_id)
                route_distance_m += arc_distance_m
                
                # Simular tiempo de viaje (Asumiendo 40 km/h -> 40000 m / 60 min -> 666 m/min)
                travel_time_min = arc_distance_m / 666.0 if arc_distance_m > 0 else 0
                current_time += timedelta(minutes=int(travel_time_min))
                
            # Agregar el viaje de vuelta al depósito (suma a la distancia y tiempo)
            distance_km = round(route_distance_m / 1000.0, 2)
            time_estimated_min = int((current_time - base_time).total_seconds() / 60)
            
            routes.append({
                "vehicleId": vehiculos[vehicle_id].id,
                "distanceKm": distance_km,
                "timeEstimatedMin": time_estimated_min,
                "load": {
                    "boxes": int(route_load_boxes),
                    "weight": round(route_load_weight, 2),
                    "volume": round(route_load_volume, 2)
                },
                "stops": stops
            })
            
            total_distance_km += distance_km
            total_time_min += time_estimated_min
            
        return {
            "status": "SUCCESS",
            "algorithm": {
                "clustering": "NONE",
                "routing": "OR_TOOLS_CVRP"
            },
            "metrics": {
                "distanceTotalKm": round(total_distance_km, 2),
                "timeTotalMin": total_time_min,
                "vehiclesUsed": vehicles_used
            },
            "routes": routes
        }
