import { apiClient, PaginatedResponse } from '@/services/api/api.client';

export interface Contrato {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin?: string;
  estado: 'BORRADOR' | 'ACTIVO' | 'FINALIZADO' | 'CANCELADO';
  createdAt?: string;
}

export interface VentanaEntrega {
  horaInicio: string;
  horaFin: string;
  diaSemana?: number;
}

export interface PuntoEntrega {
  id: string;
  contratoId: string;
  codigo: string;
  nombre: string;
  direccion?: string;
  latitud: number;
  longitud: number;
  tiempoServicioMinutos: number;
  estado: string;
  ventanas: VentanaEntrega[];
}

export interface ContratosParams {
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
}

export const contratoService = {
  // Contratos
  async listar(params: ContratosParams): Promise<PaginatedResponse<Contrato>> {
    return apiClient.get('/contratos', { params });
  },

  async crear(data: Partial<Contrato>): Promise<Contrato> {
    return apiClient.post('/contratos', data);
  },

  // Puntos de Entrega
  async listarPuntos(contratoId: string): Promise<PuntoEntrega[]> {
    return apiClient.get(`/contratos/${contratoId}/puntos-entrega`);
  },

  async agregarPunto(contratoId: string, data: Partial<PuntoEntrega>): Promise<PuntoEntrega> {
    return apiClient.post(`/contratos/${contratoId}/puntos-entrega`, data);
  }
};
