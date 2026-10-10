import { apiClient } from '../../../services/api/api.client';

export interface JornadaListado {
  id: string;
  codigo: string;
  fecha: string;
  estado: string;
  contratoCodigo: string;
  contratoNombre: string;
  demandasCount: number;
  planificacionesCount: number;
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

class JornadasService {
  async listar(params: {
    page?: number;
    limit?: number;
    search?: string;
    estado?: string;
  }): Promise<PaginatedResponse<JornadaListado>> {
    return apiClient.get('/jornadas', { params });
  }
}

export const jornadasService = new JornadasService();
