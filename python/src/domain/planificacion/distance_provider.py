from abc import ABC, abstractmethod
from typing import Dict, Tuple

class DistanceMatrixProvider(ABC):
    @abstractmethod
    def distancia(self, origin_id: str, dest_id: str) -> float:
        """Devuelve la distancia en metros entre origin_id y dest_id."""
        pass

    @abstractmethod
    def tiempo(self, origin_id: str, dest_id: str) -> float:
        """Devuelve el tiempo de viaje en segundos entre origin_id y dest_id."""
        pass

    @abstractmethod
    def get_distance_matrix(self) -> Dict[str, Dict[str, float]]:
        """Devuelve la matriz completa de distancias (en metros)."""
        pass

    @abstractmethod
    def get_time_matrix(self) -> Dict[str, Dict[str, float]]:
        """Devuelve la matriz completa de tiempos (en segundos)."""
        pass
