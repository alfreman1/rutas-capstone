from abc import ABC, abstractmethod
from typing import List, Dict, Any

class Sectorizador(ABC):
    @abstractmethod
    def agrupar(self, puntos: List[Dict[str, Any]], parametros: Dict[str, Any]) -> Dict[int, List[str]]:
        """
        Recibe una lista de puntos (diccionarios con 'id', 'latitud', 'longitud' mínimo)
        y parámetros específicos del algoritmo (ej. 'n_sectores' para kmeans).
        Retorna un diccionario donde la clave es el ID del sector (0, 1, 2...)
        y el valor es la lista de IDs de los puntos asignados a ese sector.
        """
        pass
