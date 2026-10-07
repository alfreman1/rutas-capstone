from typing import List, Optional
from datetime import datetime, time
from pydantic import BaseModel, Field

# --- Productos e Inventario ---

class Producto(BaseModel):
    id: str
    codigo: str
    nombre: str
    unidad: str
    peso_unitario: float = Field(default=0.0, description="Peso por unidad en kg")
    volumen_unitario: float = Field(default=0.0, description="Volumen por unidad en m3")

class Almacen(BaseModel):
    id: str
    codigo: str
    nombre: str
    latitud: float
    longitud: float
    capacidad: float
    activo: bool = True

class Stock(BaseModel):
    producto_id: str
    almacen_id: str
    cantidad_disponible: float

# --- Demanda ---

class DetallePedido(BaseModel):
    pedido_id: str
    producto_id: str
    cantidad: float
    
    # Estos campos pueden ser calculados o enriquecidos posteriormente
    peso_total: float = 0.0
    volumen_total: float = 0.0
    cantidad_cajas: float = 0.0

class Pedido(BaseModel):
    id: str
    jornada_id: str
    contrato_id: str
    punto_entrega_id: str
    detalles: List[DetallePedido] = []

    @property
    def peso_total(self) -> float:
        return sum(d.peso_total for d in self.detalles)

    @property
    def volumen_total(self) -> float:
        return sum(d.volumen_total for d in self.detalles)

class Jornada(BaseModel):
    id: str
    fecha: datetime
    almacen_origen_id: str

# --- Puntos de Entrega ---

class PuntoEntrega(BaseModel):
    id: str
    codigo: str
    nombre: str
    latitud: float
    longitud: float
    ventana_inicio: Optional[time] = None
    ventana_fin: Optional[time] = None
    tiempo_servicio: float = Field(default=15.0, description="Tiempo estimado en minutos")
    prioridad: int = Field(default=1, description="Mayor número = mayor prioridad")
    tipo_punto: Optional[str] = None

# --- Flota ---

class Vehiculo(BaseModel):
    id: str
    codigo: str
    capacidad_peso: float
    capacidad_volumen: float
    capacidad_cajas: float
    velocidad_promedio: float = Field(default=40.0, description="Velocidad en km/h")
    disponible: bool = True
