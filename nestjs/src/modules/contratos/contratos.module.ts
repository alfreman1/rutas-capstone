import { Module } from '@nestjs/common';
import { ContratoController } from './presentation/controllers/contrato.controller';
import { PuntoEntregaController } from './presentation/controllers/punto-entrega.controller';
import { CrearContratoUseCase } from './application/use-cases/crear-contrato.use-case';
import { ListarContratosUseCase } from './application/use-cases/listar-contratos.use-case';
import { CrearPuntoEntregaUseCase } from './application/use-cases/crear-punto-entrega.use-case';
import { ListarPuntosEntregaUseCase } from './application/use-cases/listar-puntos-entrega.use-case';
import { ListarTodosPuntosEntregaUseCase } from './application/use-cases/listar-todos-puntos-entrega.use-case';
import { CONTRATO_REPOSITORY } from './domain/repositories/contrato.repository';
import { PUNTO_ENTREGA_REPOSITORY } from './domain/repositories/punto-entrega.repository';
import { ContratoPrismaRepository } from './infrastructure/persistence/prisma/repositories/contrato.prisma.repository';
import { PuntoEntregaPrismaRepository } from './infrastructure/persistence/prisma/repositories/punto-entrega.prisma.repository';

@Module({
  controllers: [ContratoController, PuntoEntregaController],
  providers: [
    {
      provide: CONTRATO_REPOSITORY,
      useClass: ContratoPrismaRepository,
    },
    {
      provide: PUNTO_ENTREGA_REPOSITORY,
      useClass: PuntoEntregaPrismaRepository,
    },
    CrearContratoUseCase,
    ListarContratosUseCase,
    CrearPuntoEntregaUseCase,
    ListarPuntosEntregaUseCase,
    ListarTodosPuntosEntregaUseCase,
  ],
  exports: [CONTRATO_REPOSITORY, PUNTO_ENTREGA_REPOSITORY],
})
export class ContratosModule {}
