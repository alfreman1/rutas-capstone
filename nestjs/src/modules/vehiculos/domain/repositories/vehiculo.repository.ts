import { Vehiculo } from '../entities/vehiculo.entity';

export const VEHICULO_REPOSITORY = Symbol('VEHICULO_REPOSITORY');

export interface VehiculoQuery {
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
  tipo?: string;
}

export interface PaginatedVehiculos {
  items: Vehiculo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface VehiculoRepository {
  crear(vehiculo: Partial<Vehiculo>): Promise<Vehiculo>;
  buscarPorId(id: string): Promise<Vehiculo | null>;
  buscarPorPlaca(placa: string): Promise<Vehiculo | null>;
  listar(query: VehiculoQuery): Promise<PaginatedVehiculos>;
  actualizarEstado(id: string, estado: string): Promise<Vehiculo>;
}
