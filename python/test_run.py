import pprint
from src.api.routes.optimization import optimize_synthetic_journey

if __name__ == "__main__":
    print("Iniciando optimización sintética para Sucre, Bolivia...")
    # Prueba con 20 puntos, 3 vehículos disponibles y divididos en 2 sectores.
    resultado = optimize_synthetic_journey(num_points=20, num_vehicles=3, n_sectores=2)
    
    pprint.pprint(resultado)
    print("----")
    print(f"Distancia Total (km): {resultado['distancia_total_km']}")
    print(f"Vehículos Utilizados: {resultado['vehiculos_utilizados']}")
    print(f"Tiempo de cómputo: {resultado['tiempo_computo_segundos']}s")
