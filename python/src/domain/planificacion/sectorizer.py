from abc import ABC, abstractmethod
from typing import List, Dict, Any
from src.domain.models import PuntoEntrega, Vehiculo

class Sectorizer(ABC):
    """
    Abstracción para el algoritmo de sectorización.
    Permite cambiar de algoritmo (K-Means, DBSCAN, etc.) sin afectar el dominio.
    """

    @abstractmethod
    def sectorize(self, puntos: List[PuntoEntrega], num_sectores: int) -> Dict[int, List[PuntoEntrega]]:
        """
        Agrupa los puntos de entrega en `num_sectores` sectores.
        Retorna un diccionario donde la clave es el ID del sector (0, 1, 2...)
        y el valor es la lista de PuntoEntrega asignada a ese sector.
        """
        pass
