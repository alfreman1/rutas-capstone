from fastapi import APIRouter, BackgroundTasks, HTTPException
from src.api.schemas import OptimizacionRequest, OptimizacionResponse
from src.application.services import optimization_service
import uuid

router = APIRouter()

@router.post("/routes/jobs", response_model=OptimizacionResponse, tags=["Optimization"])
async def create_optimization_job(request: OptimizacionRequest, background_tasks: BackgroundTasks):
    """
    Recibe la matriz de datos de NestJS y encola el trabajo de optimización de rutas (VRP).
    Devuelve inmediatamente un job_id en estado PENDING.
    """
    job_id = str(uuid.uuid4())
    
    # Registramos el job inicial en memoria/redis
    optimization_service.create_job(job_id, request)

    # Lanzamos el proceso matemático pesado en background (no bloquea el hilo HTTP)
    background_tasks.add_task(optimization_service.process_vrp_job, job_id)

    return OptimizacionResponse(
        job_id=job_id,
        status="PENDIENTE",
        message="El trabajo ha sido encolado exitosamente."
    )

@router.get("/routes/jobs/{job_id}", tags=["Optimization"])
async def get_job_status(job_id: str):
    """
    Permite a NestJS (o al Frontend vía NestJS) consultar el estado de la optimización.
    """
    job = optimization_service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job no encontrado")
    
    return job
