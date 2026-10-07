import random
import uuid
from datetime import datetime
from src.domain.models import Pedido, DetallePedido, PuntoEntrega, Almacen, Vehiculo, Jornada

# Coordenadas centrales de Sucre, Bolivia
SUCRE_LAT = -19.03332
SUCRE_LON = -65.26274

def generate_random_coordinate(center_lat: float, center_lon: float, max_offset: float = 0.05) -> tuple[float, float]:
    """Genera coordenadas aleatorias alrededor de un punto central."""
    lat = center_lat + random.uniform(-max_offset, max_offset)
    lon = center_lon + random.uniform(-max_offset, max_offset)
    return lat, lon

def generate_synthetic_dataset(num_points: int = 50, num_vehicles: int = 5):
    """Genera un dataset sintético para pruebas ubicado en Sucre, Bolivia."""
    
    # 1. Crear Almacén (Depósito)
    almacen = Almacen(
        id=str(uuid.uuid4()),
        codigo="ALM-SUCRE-01",
        nombre="Almacén Central Sucre",
        latitud=SUCRE_LAT,
        longitud=SUCRE_LON,
        capacidad=100000.0,
        activo=True
    )
    
    # 2. Crear Vehículos
    vehiculos = []
    for i in range(num_vehicles):
        vehiculos.append(
            Vehiculo(
                id=f"VEH-{i+1:03d}",
                codigo=f"V{i+1}",
                capacidad_peso=random.choice([1500.0, 3000.0, 5000.0]), # kg
                capacidad_volumen=random.choice([10.0, 15.0, 20.0]),    # m3
                capacidad_cajas=random.choice([50.0, 100.0, 200.0]),
                velocidad_promedio=random.choice([25.0, 30.0, 40.0]) # km/h (velocidad urbana)
            )
        )
        
    # 3. Crear Puntos de Entrega y Pedidos
    puntos_entrega = []
    pedidos = []
    
    jornada = Jornada(
        id=str(uuid.uuid4()),
        fecha=datetime.now(),
        almacen_origen_id=almacen.id
    )
    
    for i in range(num_points):
        # Generar punto alrededor de Sucre (radio aprox 5km)
        lat, lon = generate_random_coordinate(SUCRE_LAT, SUCRE_LON, 0.04)
        punto = PuntoEntrega(
            id=f"PNT-{i+1:03d}",
            codigo=f"PT{i+1}",
            nombre=f"Cliente {i+1} Sucre",
            latitud=lat,
            longitud=lon,
            tiempo_servicio=random.choice([5.0, 10.0, 15.0]) # Minutos
        )
        puntos_entrega.append(punto)
        
        # Generar pedido asociado a este punto
        pedido = Pedido(
            id=f"PED-{i+1:03d}",
            jornada_id=jornada.id,
            contrato_id=f"CTR-{i+1:03d}",
            punto_entrega_id=punto.id,
            detalles=[
                DetallePedido(
                    pedido_id=f"PED-{i+1:03d}",
                    producto_id="PROD-GENERICO",
                    cantidad=1.0,
                    peso_total=random.uniform(50.0, 200.0),    # 50 - 200 kg
                    volumen_total=random.uniform(0.5, 2.0),    # 0.5 - 2 m3
                    cantidad_cajas=random.uniform(1.0, 10.0)   # 1 - 10 cajas
                )
            ]
        )
        pedidos.append(pedido)
        
    return {
        "almacen": almacen,
        "vehiculos": vehiculos,
        "puntos_entrega": puntos_entrega,
        "pedidos": pedidos,
        "jornada": jornada
    }

if __name__ == "__main__":
    dataset = generate_synthetic_dataset(20, 3)
    print(f"Generado almacén en: {dataset['almacen'].latitud}, {dataset['almacen'].longitud}")
    print(f"Generados {len(dataset['vehiculos'])} vehículos.")
    print(f"Generados {len(dataset['puntos_entrega'])} puntos de entrega y {len(dataset['pedidos'])} pedidos.")
    print(f"Ejemplo Punto 1: {dataset['puntos_entrega'][0].latitud}, {dataset['puntos_entrega'][0].longitud}")
