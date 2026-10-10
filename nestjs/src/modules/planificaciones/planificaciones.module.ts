import { Module } from '@nestjs/common';
import { PlanificacionController } from './presentation/controllers/planificacion.controller';
import { JornadaController } from './presentation/controllers/jornada.controller';
import { SolicitarOptimizacionUseCase } from './application/use-cases/solicitar-optimizacion.use-case';
import { ConsultarEstadoOptimizacionUseCase } from './application/use-cases/consultar-estado-optimizacion.use-case';
import { ListarPlanificacionesUseCase } from './application/use-cases/listar-planificaciones.use-case';
import { ListarJornadasUseCase } from './application/use-cases/listar-jornadas.use-case';
import { OPTIMIZACION_PORT } from './domain/ports/optimizacion.port';
import { PythonOptimizacionAdapter } from './infrastructure/adapters/python-optimizacion.adapter';

@Module({
  controllers: [PlanificacionController, JornadaController],
  providers: [
    {
      provide: OPTIMIZACION_PORT,
      useClass: PythonOptimizacionAdapter,
    },
    SolicitarOptimizacionUseCase,
    ConsultarEstadoOptimizacionUseCase,
    ListarPlanificacionesUseCase,
    ListarJornadasUseCase,
  ],
})
export class PlanificacionesModule {}
