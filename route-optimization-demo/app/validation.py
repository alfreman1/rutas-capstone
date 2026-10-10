"""Recompute every route independently of OR-Tools before showing results."""
from collections import Counter
from app.data import DEPOT
from app.network import nodes_for, distance_meters, travel_seconds


def route_details(order_ids, scenario, vehicle):
    nodes = {node["id"]: node for node in nodes_for(scenario)}
    previous, elapsed, distance, load = DEPOT, 0, 0, 0
    stops = []
    for order_id in order_ids:
        node = nodes[order_id]
        elapsed += travel_seconds(previous, node, scenario.speed_kmh)
        distance += distance_meters(previous, node)
        arrival = elapsed
        elapsed += node["service_minutes"] * 60
        load += node["demand"]
        stops.append({"id": order_id, "arrival_seconds": arrival,
                      "departure_seconds": elapsed, "demand": node["demand"]})
        previous = node
    elapsed += travel_seconds(previous, DEPOT, scenario.speed_kmh)
    distance += distance_meters(previous, DEPOT)
    return {"vehicle": vehicle, "order_ids": order_ids, "stops": stops,
            "distance_meters": distance, "duration_seconds": elapsed,
            "service_seconds": sum(nodes[i]["service_minutes"] * 60 for i in order_ids),
            "load": load, "capacity": scenario.capacity,
            "valid": load <= scenario.capacity and elapsed <= scenario.max_minutes * 60}


def validate_plan(routes, scenario):
    expected = {order.id for order in scenario.orders}
    flat = [node for route in routes for node in route]
    counts = Counter(flat)
    errors = []
    if len(routes) != scenario.vehicles:
        errors.append("La cantidad de rutas no coincide con la flota.")
    if set(flat) - expected:
        errors.append("Hay identificadores desconocidos o un depósito dentro de las paradas.")
    if any(count > 1 for count in counts.values()):
        errors.append("Hay pedidos visitados más de una vez.")
    missing = sorted(expected - set(flat))
    if missing:
        errors.append("Hay pedidos sin asignar.")
    details = [] if set(flat) - expected else [route_details(route, scenario, i+1) for i, route in enumerate(routes)]
    if any(not route["valid"] for route in details):
        errors.append("Se supera la capacidad o duración máxima de una ruta.")
    return {"feasible": not errors, "errors": errors, "unassigned": missing, "routes": details,
            "total_distance_meters": sum(r["distance_meters"] for r in details),
            "total_duration_seconds": sum(r["duration_seconds"] for r in details),
            "makespan_seconds": max((r["duration_seconds"] for r in details), default=0),
            "vehicles_used": sum(bool(r) for r in routes),
            "served_orders": len(set(flat) & expected), "total_orders": len(expected)}


def infeasibility_reasons(scenario):
    reasons = []
    total = sum(order.demand for order in scenario.orders)
    if total > scenario.vehicles * scenario.capacity:
        reasons.append(f"Los pedidos suman {total} cajas y la flota admite {scenario.vehicles * scenario.capacity}.")
    if any(order.demand > scenario.capacity for order in scenario.orders):
        reasons.append("Al menos un pedido supera la capacidad de un vehículo y no puede dividirse.")
    if any(route_details([order.id], scenario, 1)["duration_seconds"] > scenario.max_minutes * 60
           for order in scenario.orders):
        reasons.append("Al menos una entrega no cabe en el turno, incluso viajando sola y regresando al depósito.")
    return reasons
