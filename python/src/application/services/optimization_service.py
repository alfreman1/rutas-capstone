import time
from typing import Dict, Any

# MOCK: En producción usar Redis o una BD temporal para llevar registro de Jobs
_jobs_db: Dict[str, Any] = {}

def create_job(job_id: str, request_data: Any):
    _jobs_db[job_id] = {
        "job_id": job_id,
        "status": "PROCESANDO",
        "result": None,
        "created_at": time.time()
    }

def get_job(job_id: str) -> Any:
    return _jobs_db.get(job_id)

def process_vrp_job(job_id: str):
    """
    Simulación del proceso pesado: 
    1. Armar matriz de distancias (OSRM / Haversine)
    2. K-Means / DBSCAN para clústeres preliminares
    3. Google OR-Tools para VRPTW
    """
    try:
        # Simulamos que calcular las rutas demora 5 segundos
        time.sleep(5)
        
        # Aquí llamaríamos a la capa de dominio `infrastructure/ortools_solver.py`
        
        # MOCK de la respuesta esperada
        _jobs_db[job_id]["status"] = "COMPLETADA"
        _jobs_db[job_id]["result"] = {
            "distanciaTotalKm": 125.4,
            "tiempoTotalMinutos": 340,
            "vehiculosUtilizados": 2,
            "rutas": [
                {
                    "vehiculoId": "vehiculo-uuid-1",
                    "distanciaKm": 60.0,
                    "entregas": [
                        {"orden": 1, "puntoEntregaId": "punto-uuid-A"},
                        {"orden": 2, "puntoEntregaId": "punto-uuid-B"}
                    ]
                }
            ]
        }
    except Exception as e:
        _jobs_db[job_id]["status"] = "ERROR"
        _jobs_db[job_id]["error_detail"] = str(e)
