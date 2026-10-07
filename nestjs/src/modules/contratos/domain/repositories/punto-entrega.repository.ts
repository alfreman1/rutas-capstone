import { PuntoEntrega } from '../entities/punto-entrega.entity';

export const PUNTO_ENTREGA_REPOSITORY = Symbol('PUNTO_ENTREGA_REPOSITORY');

export interface PuntoEntregaRepository {
  crear(puntoEntrega: Partial<PuntoEntrega>): Promise<PuntoEntrega>;
  buscarPorId(id: string): Promise<PuntoEntrega | null>;
  buscarPorCodigo(contratoId: string, codigo: string): Promise<PuntoEntrega | null>;
  listarPorContrato(contratoId: string): Promise<PuntoEntrega[]>;
}
