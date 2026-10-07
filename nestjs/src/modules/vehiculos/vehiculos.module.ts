import { Module } from '@nestjs/common';
import { VehiculoController } from './presentation/controllers/vehiculo.controller';
import { CrearVehiculoUseCase } from './application/use-cases/crear-vehiculo.use-case';
import { ListarVehiculosUseCase } from './application/use-cases/listar-vehiculos.use-case';
import { VEHICULO_REPOSITORY } from './domain/repositories/vehiculo.repository';
import { VehiculoPrismaRepository } from './infrastructure/persistence/prisma/repositories/vehiculo.prisma.repository';

@Module({
  controllers: [VehiculoController],
  providers: [
    {
      provide: VEHICULO_REPOSITORY,
      useClass: VehiculoPrismaRepository,
    },
    CrearVehiculoUseCase,
    ListarVehiculosUseCase,
  ],
  exports: [VEHICULO_REPOSITORY],
})
export class VehiculosModule {}
