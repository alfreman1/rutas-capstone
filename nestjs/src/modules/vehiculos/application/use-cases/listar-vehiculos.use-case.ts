import { Injectable, Inject } from '@nestjs/common';
import { VEHICULO_REPOSITORY, VehiculoRepository, VehiculoQuery, PaginatedVehiculos } from '../../domain/repositories/vehiculo.repository';
import { Vehiculo } from '../../domain/entities/vehiculo.entity';

@Injectable()
export class ListarVehiculosUseCase {
  constructor(
    @Inject(VEHICULO_REPOSITORY)
    private readonly vehiculoRepository: VehiculoRepository,
  ) {}

  async execute(query: VehiculoQuery): Promise<PaginatedVehiculos> {
    return await this.vehiculoRepository.listar(query);
  }
}
