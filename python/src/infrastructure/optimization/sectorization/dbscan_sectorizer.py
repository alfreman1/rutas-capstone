from typing import List, Dict, Any
from sklearn.cluster import DBSCAN
import numpy as np
import math
from src.domain.optimizacion.sectorizador import Sectorizador

class DBSCANSectorizer(Sectorizador):
    def agrupar(self, puntos: List[Dict[str, Any]], parametros: Dict[str, Any]) -> Dict[int, List[str]]:
        if not puntos:
            return {}
            
        # eps en kilometros convertido a radianes (aproximadamente para coords geográficas)
        eps_km = parametros.get('eps_km', 2.0)
        eps_rad = eps_km / 6371.0 # 6371 km es el radio de la tierra
        min_samples = parametros.get('min_samples', 3)
        
        # DBSCAN requiere radianes para usar la métrica 'haversine'
        coords_rad = np.radians([[p['latitud'], p['longitud']] for p in puntos])
        
        dbscan = DBSCAN(eps=eps_rad, min_samples=min_samples, algorithm='ball_tree', metric='haversine')
        labels = dbscan.fit_predict(coords_rad)
        
        sectores = {}
        for i, label in enumerate(labels):
            cluster_id = int(label)
            # cluster_id = -1 significa "ruido". Los asignamos a un sector de ruido si se desea,
            # pero por ahora los mantenemos como el sector -1
            if cluster_id not in sectores:
                sectores[cluster_id] = []
            sectores[cluster_id].append(puntos[i]['id'])
            
        return sectores
