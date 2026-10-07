import { Injectable, Inject } from '@nestjs/common';
import { PUNTO_ENTREGA_REPOSITORY, PuntoEntregaRepository } from '../../domain/repositories/punto-entrega.repository';
import { CONTRATO_REPOSITORY, ContratoRepository } from '../../domain/repositories/contrato.repository';
import { CrearPuntoEntregaDto } from '../dto/crear-punto-entrega.dto';
import { PuntoEntrega } from '../../domain/entities/punto-entrega.entity';
import { VentanaEntrega } from '../../domain/entities/ventana-entrega.entity';
import { BusinessRuleException, NotFoundDomainException } from '../../../../shared/domain/exceptions/domain.exception';

@Injectable()
export class CrearPuntoEntregaUseCase {
  constructor(
    @Inject(PUNTO_ENTREGA_REPOSITORY)
    private readonly puntoEntregaRepository: PuntoEntregaRepository,
    @Inject(CONTRATO_REPOSITORY)
    private readonly contratoRepository: ContratoRepository,
  ) {}

  async execute(contratoId: string, dto: CrearPuntoEntregaDto): Promise<PuntoEntrega> {
    const contrato = await this.contratoRepository.buscarPorId(contratoId);
    if (!contrato) {
      throw new NotFoundDomainException(`Contrato con ID ${contratoId} no existe.`);
    }

    const existente = await this.puntoEntregaRepository.buscarPorCodigo(contratoId, dto.codigo);
    if (existente) {
      throw new BusinessRuleException(`El código de punto ${dto.codigo} ya existe en este contrato.`);
    }

    const punto = new PuntoEntrega(
      '', // ID se generará en DB
      contratoId,
      dto.codigo,
      dto.nombre,
      dto.latitud,
      dto.longitud,
      dto.tiempoServicioMinutos || 10,
      'ACTIVO',
      [],
      dto.direccion
    );

    if (dto.ventanas) {
      dto.ventanas.forEach(v => {
        const ventana = new VentanaEntrega('', v.horaInicio, v.horaFin, 'ACTIVO', v.diaSemana);
        punto.agregarVentana(ventana);
      });
    }

    return await this.puntoEntregaRepository.crear(punto);
  }
}
