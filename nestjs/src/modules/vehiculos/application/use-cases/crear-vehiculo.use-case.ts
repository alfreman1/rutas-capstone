import { Injectable, Inject } from '@nestjs/common';
import { VEHICULO_REPOSITORY, VehiculoRepository } from '../../domain/repositories/vehiculo.repository';
import { CrearVehiculoDto } from '../dto/crear-vehiculo.dto';
import { Vehiculo } from '../../domain/entities/vehiculo.entity';
import { BusinessRuleException } from '../../../../shared/domain/exceptions/domain.exception';

@Injectable()
export class CrearVehiculoUseCase {
  constructor(
    @Inject(VEHICULO_REPOSITORY)
    private readonly vehiculoRepository: VehiculoRepository,
  ) {}

  async execute(dto: CrearVehiculoDto): Promise<Vehiculo> {
    const existente = await this.vehiculoRepository.buscarPorPlaca(dto.placa);
    if (existente) {
      throw new BusinessRuleException(`Ya existe un vehículo con la placa ${dto.placa}.`);
    }

    const vehiculo = new Vehiculo(
      '', // DB genera ID
      dto.placa,
      dto.codigo,
      dto.tipo,
      dto.capacidadPesoKg,
      dto.capacidadVolumenM3,
      'ACTIVO',
      dto.marca,
      dto.modelo
    );

    return await this.vehiculoRepository.crear(vehiculo);
  }
}
