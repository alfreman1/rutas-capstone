"""Improve total distance subject to indivisible loads and route duration."""
import hashlib
import json
import time
from ortools.constraint_solver import pywrapcp, routing_enums_pb2
from app.baseline import build_baseline
from app.network import matrices
from app.validation import validate_plan, infeasibility_reasons

SEARCH_SECONDS = 2


def solve_routes(scenario, baseline, search_seconds):
    nodes, distance, duration = matrices(scenario)
    manager = pywrapcp.RoutingIndexManager(len(nodes), scenario.vehicles, 0)
    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index, to_index):
        return distance[manager.IndexToNode(from_index)][manager.IndexToNode(to_index)]

    def time_callback(from_index, to_index):
        return duration[manager.IndexToNode(from_index)][manager.IndexToNode(to_index)]

    def demand_callback(index):
        return nodes[manager.IndexToNode(index)]["demand"]

    distance_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(distance_index)
    demand_index = routing.RegisterUnaryTransitCallback(demand_callback)
    routing.AddDimensionWithVehicleCapacity(demand_index, 0, [scenario.capacity] * scenario.vehicles, True, "Capacity")
    time_index = routing.RegisterTransitCallback(time_callback)
    routing.AddDimension(time_index, 0, scenario.max_minutes * 60, True, "Duration")
    # No optional visits: every order must be served exactly once.
    parameters = pywrapcp.DefaultRoutingSearchParameters()
    parameters.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    parameters.local_search_metaheuristic = routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    parameters.time_limit.FromMilliseconds(round(search_seconds * 1000))
    initial = None
    if baseline["feasible"]:
        indices = {node["id"]: index for index, node in enumerate(nodes)}
        initial = routing.ReadAssignmentFromRoutes(
            [[indices[i] for i in route["order_ids"]] for route in baseline["routes"]], True)
    solution = (routing.SolveFromAssignmentWithParameters(initial, parameters) if initial is not None
                else routing.SolveWithParameters(parameters))
    if solution is None:
        return None, routing.status()
    routes = []
    for vehicle in range(scenario.vehicles):
        index, route = routing.Start(vehicle), []
        while not routing.IsEnd(index):
            node = manager.IndexToNode(index)
            if node != 0:
                route.append(nodes[node]["id"])
            index = solution.Value(routing.NextVar(index))
        routes.append(route)
    plan = validate_plan(routes, scenario)
    if not plan["feasible"]:
        raise RuntimeError("Solver output failed independent constraint validation.")
    return plan, routing.status()


def optimize(scenario, search_seconds=SEARCH_SECONDS):
    started = time.perf_counter()
    baseline = build_baseline(scenario)
    reasons = infeasibility_reasons(scenario)
    candidate, solver_status = (None, None) if reasons else solve_routes(scenario, baseline, search_seconds)
    chosen, source = candidate, "ortools"
    # Keep a complete baseline if bounded search does not improve it.
    if baseline["feasible"] and (candidate is None or candidate["total_distance_meters"] > baseline["total_distance_meters"]):
        chosen, source = baseline, "baseline_retained"
    savings = None
    if baseline["feasible"] and chosen:
        distance = baseline["total_distance_meters"]
        saved = distance - chosen["total_distance_meters"]
        savings = {"meters": saved, "percent": 100 * saved / distance if distance else 0.0}
    fingerprint = hashlib.sha256(json.dumps(scenario.model_dump(), sort_keys=True).encode()).hexdigest()
    return {"scenario": scenario.model_dump(), "scenario_sha256": fingerprint,
            "status": "proven_infeasible" if reasons else "feasible" if chosen else "no_solution_found",
            "reasons": reasons, "baseline": baseline, "optimized": chosen,
            "solution_source": source if chosen else None, "savings": savings,
            "search_limit_seconds": search_seconds, "elapsed_seconds": round(time.perf_counter() - started, 3),
            "solver_status_code": solver_status, "optimality_proven": False,
            "assumptions": "Cuadrícula ficticia de 500 m; distancia Manhattan, velocidad constante, un viaje por vehículo y regreso al depósito."}
