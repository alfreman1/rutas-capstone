import { apiClient, PaginatedResponse } from '@/services/api/api.client';

export interface Vehiculo {
  id: string;
  placa: string;
  codigo: string;
  tipo: 'FURGON' | 'CAMION' | 'MOTO' | 'CAMIONETA';
  capacidadPesoKg: number;
  capacidadVolumenM3: number;
  estado: 'ACTIVO' | 'INACTIVO' | 'MANTENIMIENTO';
  marca?: string;
  modelo?: string;
}

export interface VehiculosParams {
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
  tipo?: string;
}

export const vehiculoService = {
  async listar(params: VehiculosParams): Promise<PaginatedResponse<Vehiculo>> {
    return apiClient.get('/vehiculos', { params });
  },

  async crear(data: Omit<Vehiculo, 'id' | 'estado'>): Promise<Vehiculo> {
    return apiClient.post('/vehiculos', data);
  }
};
