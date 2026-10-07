import { Injectable, Inject } from '@nestjs/common';
import { PUNTO_ENTREGA_REPOSITORY, PuntoEntregaRepository } from '../../domain/repositories/punto-entrega.repository';
import { PuntoEntrega } from '../../domain/entities/punto-entrega.entity';

@Injectable()
export class ListarPuntosEntregaUseCase {
  constructor(
    @Inject(PUNTO_ENTREGA_REPOSITORY)
    private readonly puntoEntregaRepository: PuntoEntregaRepository,
  ) {}

  async execute(contratoId: string): Promise<PuntoEntrega[]> {
    return await this.puntoEntregaRepository.listarPorContrato(contratoId);
  }
}
