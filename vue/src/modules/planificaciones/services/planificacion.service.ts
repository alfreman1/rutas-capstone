import { apiClient } from '@/services/api/api.client';

export interface OptimizacionResponse {
  success: boolean;
  message: string;
  jobId: string;
  optimizacionId: string;
}

export interface EstadoOptimizacionResponse {
  estado: 'PENDIENTE' | 'PROCESANDO' | 'COMPLETADA' | 'ERROR';
  resultado?: any;
  error?: string;
}

export const planificacionService = {
  async listar(params: any = {}) {
    return apiClient.get('/planificaciones', { params });
  },

  // Mock endpoint to simulate fetching a Planificacion Details
  async obtenerDetalle(id: string) {
    // In a real scenario, this gets data from GET /planificaciones/:id
    return {
      id,
      estado: 'BORRADOR', // BORRADOR | PROCESANDO | GENERADA | ERROR
      jornada: {
        fecha: '2026-10-06',
        puntosTotales: 87,
      },
      vehiculos: [],
    };
  },

  async solicitarOptimizacion(id: string, vehiculosIds: string[], algoritmo?: string): Promise<OptimizacionResponse> {
    return apiClient.post(`/planificaciones/${id}/optimizar`, { vehiculosIds, algoritmo });
  },

  async consultarEstado(id: string): Promise<EstadoOptimizacionResponse> {
    return apiClient.get(`/planificaciones/${id}/estado`);
  }
};
