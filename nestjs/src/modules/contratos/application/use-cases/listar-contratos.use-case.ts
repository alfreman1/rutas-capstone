import { Injectable, Inject } from '@nestjs/common';
import { CONTRATO_REPOSITORY, ContratoRepository, ContratoQuery, PaginatedResult } from '../../domain/repositories/contrato.repository';
import { Contrato } from '../../domain/entities/contrato.entity';

@Injectable()
export class ListarContratosUseCase {
  constructor(
    @Inject(CONTRATO_REPOSITORY)
    private readonly contratoRepository: ContratoRepository,
  ) {}

  async execute(query: ContratoQuery): Promise<PaginatedResult<Contrato>> {
    return await this.contratoRepository.listar(query);
  }
}
