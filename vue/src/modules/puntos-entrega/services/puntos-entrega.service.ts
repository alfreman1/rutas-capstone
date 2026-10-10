import { apiClient } from '../../../services/api/api.client';

export interface PuntoEntregaListado {
  id: string;
  codigo: string;
  nombre: string;
  direccion: string;
  contratoCodigo: string;
  latitud: number;
  longitud: number;
  estado: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

class PuntosEntregaService {
  async listar(params: {
    page?: number;
    limit?: number;
    search?: string;
    estado?: string;
  }): Promise<PaginatedResponse<PuntoEntregaListado>> {
    return apiClient.get('/puntos-entrega', { params });
  }
}

export const puntosEntregaService = new PuntosEntregaService();
