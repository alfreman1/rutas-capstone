from typing import List, Dict, Any
from sklearn.cluster import KMeans
import numpy as np
from src.domain.optimizacion.sectorizador import Sectorizador

class KMeansSectorizer(Sectorizador):
    def agrupar(self, puntos: List[Dict[str, Any]], parametros: Dict[str, Any]) -> Dict[int, List[str]]:
        if not puntos:
            return {}
            
        n_clusters = parametros.get('n_sectores', 1)
        if n_clusters > len(puntos):
            n_clusters = len(puntos)
            
        coords = np.array([[p['latitud'], p['longitud']] for p in puntos])
        
        # random_state=42 para hacer reproducible el agrupamiento durante las pruebas
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init='auto')
        labels = kmeans.fit_predict(coords)
        
        sectores = {}
        for i, label in enumerate(labels):
            cluster_id = int(label)
            if cluster_id not in sectores:
                sectores[cluster_id] = []
            sectores[cluster_id].append(puntos[i]['id'])
            
        return sectores
