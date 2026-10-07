from typing import List, Dict, Any, Optional
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
from src.domain.planificacion.distance_provider import DistanceMatrixProvider
from src.domain.models import Vehiculo, PuntoEntrega, Almacen, Pedido

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
            return {"error": "Sin puntos o vehículos para optimizar."}

        # 1. Preparar datos
        # Indexar pedidos por punto de entrega (simplificación: 1 pedido por punto)
        demandas_punto = {}
        for pedido in pedidos:
            demandas_punto[pedido.punto_entrega_id] = {
                'peso': pedido.peso_total,
                'volumen': pedido.volumen_total
            }
            
        # Nodos: Índice 0 es el almacén. Índices 1..N son los puntos.
        nodes = [almacen.id] + [p.id for p in puntos]
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
            return self._format_solution(manager, routing, solution, nodes, vehiculos)
        else:
            return {"status": "NO_SOLUTION_FOUND"}
            
    def _format_solution(self, manager, routing, solution, nodes, vehiculos) -> Dict[str, Any]:
        """Extrae la solución en un formato amigable."""
        rutas = []
        total_distance = 0
        total_load = 0
        
        for vehicle_id in range(routing.vehicles()):
            index = routing.Start(vehicle_id)
            ruta_vehiculo = {
                "vehiculo_id": vehiculos[vehicle_id].id,
                "paradas": [],
                "distancia_metros": 0,
                "carga": 0
            }
            
            route_distance = 0
            route_load = 0
            
            # Recorrer ruta
            while not routing.IsEnd(index):
                node_index = manager.IndexToNode(index)
                ruta_vehiculo["paradas"].append(nodes[node_index])
                
                previous_index = index
                index = solution.Value(routing.NextVar(index))
                route_distance += routing.GetArcCostForVehicle(previous_index, index, vehicle_id)
                
                # Para carga
                capacity_dimension = routing.GetDimensionOrDie("Capacity")
                route_load = solution.Min(capacity_dimension.CumulVar(index))
                
            # Agregar el depósito al final
            node_index = manager.IndexToNode(index)
            ruta_vehiculo["paradas"].append(nodes[node_index])
            
            ruta_vehiculo["distancia_metros"] = route_distance
            ruta_vehiculo["carga"] = route_load
            
            rutas.append(ruta_vehiculo)
            total_distance += route_distance
            total_load += route_load
            
        return {
            "status": "SUCCESS",
            "distancia_total_metros": total_distance,
            "carga_total": total_load,
            "rutas": rutas
        }
