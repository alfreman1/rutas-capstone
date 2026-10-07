import math
from typing import Dict, List, Any
from src.domain.planificacion.distance_provider import DistanceMatrixProvider

def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calcula la distancia en metros entre dos puntos geográficos."""
    R = 6371000 # Radio de la Tierra en metros
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distancia = R * c
    # Factor de tortuosidad (1.4) para aproximar calles reales
    return distancia * 1.4

class SimulatedDistanceProvider(DistanceMatrixProvider):
    def __init__(self, locations: List[Dict[str, Any]], speed_kmh: float = 30.0):
        """
        locations debe ser una lista de diccionarios con 'id', 'latitud', 'longitud'
        (puede incluir el almacén y los puntos de entrega).
        speed_kmh es la velocidad promedio en ciudad.
        """
        self.locations = {loc['id']: loc for loc in locations}
        self.speed_ms = (speed_kmh * 1000) / 3600.0
        
        self._distance_matrix: Dict[str, Dict[str, float]] = {}
        self._time_matrix: Dict[str, Dict[str, float]] = {}
        self._build_matrices()

    def _build_matrices(self):
        for id1, loc1 in self.locations.items():
            self._distance_matrix[id1] = {}
            self._time_matrix[id1] = {}
            for id2, loc2 in self.locations.items():
                if id1 == id2:
                    dist = 0.0
                else:
                    dist = haversine(loc1['latitud'], loc1['longitud'], loc2['latitud'], loc2['longitud'])
                
                self._distance_matrix[id1][id2] = dist
                self._time_matrix[id1][id2] = dist / self.speed_ms

    def distancia(self, origin_id: str, dest_id: str) -> float:
        return self._distance_matrix[origin_id][dest_id]

    def tiempo(self, origin_id: str, dest_id: str) -> float:
        return self._time_matrix[origin_id][dest_id]

    def get_distance_matrix(self) -> Dict[str, Dict[str, float]]:
        return self._distance_matrix

    def get_time_matrix(self) -> Dict[str, Dict[str, float]]:
        return self._time_matrix
