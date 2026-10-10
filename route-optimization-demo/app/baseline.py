"""Assign in input order to the first vehicle where appending is feasible."""
from app.validation import route_details, validate_plan


def build_baseline(scenario):
    routes = [[] for _ in range(scenario.vehicles)]
    for order in scenario.orders:
        for index, route in enumerate(routes):
            candidate = [*route, order.id]
            if route_details(candidate, scenario, index+1)["valid"]:
                routes[index] = candidate
                break
    # An incomplete greedy plan is explicitly invalid, not a successful baseline.
    return validate_plan(routes, scenario)
