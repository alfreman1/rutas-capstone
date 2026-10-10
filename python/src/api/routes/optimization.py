from fastapi import APIRouter, BackgroundTasks, HTTPException
from src.api.schemas import OptimizacionRequest, OptimizacionResponse, StandardResponse
from src.application.services import optimization_service
from src.application.services.demo_service import optimize_synthetic_journey, DemoRequest
import uuid

router = APIRouter()

@router.post("/routes/jobs", response_model=StandardResponse[OptimizacionResponse], tags=["Optimization"])
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

    response_data = OptimizacionResponse(
        job_id=job_id,
        status="PENDIENTE",
        message="El trabajo ha sido encolado exitosamente."
    )
    return StandardResponse(data=response_data)

@router.get("/routes/jobs/{job_id}", response_model=StandardResponse[dict], tags=["Optimization"])
async def get_job_status(job_id: str):
    """
    Permite a NestJS (o al Frontend vía NestJS) consultar el estado de la optimización.
    """
    job = optimization_service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job no encontrado")
    
    return StandardResponse(data=job)

@router.post("/demo", response_model=StandardResponse[dict], tags=["Optimization"])
async def run_optimization_demo(request: DemoRequest):
    """
    Endpoint de demostración independiente de la base de datos.
    Recibe un número de puntos y vehículos, y devuelve una planificación simulada en tiempo real.
    """
    resultado = optimize_synthetic_journey(
        num_points=request.num_points, 
        num_vehicles=request.num_vehicles,
        algorithm=request.algorithm,
        seed=request.seed
    )
    return StandardResponse(data=resultado)
