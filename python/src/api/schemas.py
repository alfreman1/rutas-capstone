from pydantic import BaseModel, Field
from typing import List, Optional, TypeVar, Generic, Any
from datetime import datetime

T = TypeVar("T")

class StandardResponse(BaseModel, Generic[T]):
    success: bool = True
    data: T
    meta: Optional[dict] = None

class VentanaHoraria(BaseModel):
    inicio: datetime
    fin: datetime

class Demanda(BaseModel):
    productoId: str
    pesoTotal: float
    volumenTotal: float

class PuntoEntrega(BaseModel):
    id: str
    latitud: float
    longitud: float
    tiempoServicioMinutos: int
    ventanas: List[VentanaHoraria]
    demandas: List[Demanda]

class Vehiculo(BaseModel):
    id: str
    capacidadPesoKg: float
    capacidadVolumenM3: float

class Restricciones(BaseModel):
    tiempoMaximoRutaMinutos: int = 480

class OptimizacionRequest(BaseModel):
    planificacionId: str
    jornadaId: str
    algoritmo: Optional[str] = "KMEANS_ORTOOLS"
    puntosEntrega: List[PuntoEntrega]
    vehiculos: List[Vehiculo]
    restricciones: Restricciones

class OptimizacionResponse(BaseModel):
    job_id: str
    status: str
    message: Optional[str] = None
