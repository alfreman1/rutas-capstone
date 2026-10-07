export interface OptimizacionRequest {
  planificacionId: string;
  jornadaId: string;
  puntosEntrega: {
    id: string;
    latitud: number;
    longitud: number;
    tiempoServicioMinutos: number;
    ventanas: { inicio: Date; fin: Date }[];
    demandas: { productoId: string; pesoTotal: number; volumenTotal: number }[];
  }[];
  vehiculos: {
    id: string;
    capacidadPesoKg: number;
    capacidadVolumenM3: number;
  }[];
  restricciones: {
    tiempoMaximoRutaMinutos: number;
  };
}

export interface OptimizacionResponse {
  jobId: string;
  estado: 'PENDIENTE' | 'PROCESANDO' | 'COMPLETADA' | 'ERROR';
  mensaje?: string;
}

export const OPTIMIZACION_PORT = Symbol('OPTIMIZACION_PORT');

export interface OptimizacionPort {
  /**
   * Envía la matriz de datos al motor de IA para iniciar el trabajo de forma asíncrona
   */
  solicitarOptimizacion(data: OptimizacionRequest): Promise<OptimizacionResponse>;
  
  /**
   * Consulta el estado actual de un trabajo en la IA
   */
  consultarEstado(jobId: string): Promise<any>;
}
