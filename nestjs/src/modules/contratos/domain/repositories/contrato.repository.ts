import { Contrato } from '../entities/contrato.entity';

export const CONTRATO_REPOSITORY = Symbol('CONTRATO_REPOSITORY');

export interface ContratoQuery {
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ContratoRepository {
  crear(contrato: Partial<Contrato>): Promise<Contrato>;
  buscarPorId(id: string): Promise<Contrato | null>;
  buscarPorCodigo(codigo: string): Promise<Contrato | null>;
  listar(query: ContratoQuery): Promise<PaginatedResult<Contrato>>;
  actualizar(id: string, contrato: Partial<Contrato>): Promise<Contrato>;
}
