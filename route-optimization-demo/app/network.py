"""Distance and time assumptions shared by both routing methods."""
import math
from app.data import DEPOT


def nodes_for(scenario):
    return [DEPOT, *[order.model_dump() for order in scenario.orders]]


def distance_meters(a, b):
    return 500 * (abs(a["x"] - b["x"]) + abs(a["y"] - b["y"]))


def travel_seconds(a, b, speed_kmh):
    return math.ceil(distance_meters(a, b) * 3600 / (speed_kmh * 1000))


def matrices(scenario):
    nodes = nodes_for(scenario)
    distance = [[distance_meters(a, b) for b in nodes] for a in nodes]
    duration = [[travel_seconds(a, b, scenario.speed_kmh) + a["service_minutes"] * 60
                 for b in nodes] for a in nodes]
    return nodes, distance, duration
