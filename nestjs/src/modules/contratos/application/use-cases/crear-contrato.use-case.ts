import { Injectable, Inject } from '@nestjs/common';
import { CONTRATO_REPOSITORY, ContratoRepository } from '../../domain/repositories/contrato.repository';
import { CrearContratoDto } from '../dto/crear-contrato.dto';
import { Contrato } from '../../domain/entities/contrato.entity';
import { BusinessRuleException } from '../../../../shared/domain/exceptions/domain.exception';

@Injectable()
export class CrearContratoUseCase {
  constructor(
    @Inject(CONTRATO_REPOSITORY)
    private readonly contratoRepository: ContratoRepository,
  ) {}

  async execute(dto: CrearContratoDto): Promise<Contrato> {
    const existente = await this.contratoRepository.buscarPorCodigo(dto.codigo);
    if (existente) {
      throw new BusinessRuleException(`El código de contrato ${dto.codigo} ya existe.`);
    }

    const nuevo = await this.contratoRepository.crear({
      codigo: dto.codigo,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      fechaInicio: new Date(dto.fechaInicio),
      fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : undefined,
      estado: 'BORRADOR',
    });

    return nuevo;
  }
}
