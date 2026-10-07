import { Module } from '@nestjs/common';
import { PlanificacionController } from './presentation/controllers/planificacion.controller';
import { SolicitarOptimizacionUseCase } from './application/use-cases/solicitar-optimizacion.use-case';
import { ConsultarEstadoOptimizacionUseCase } from './application/use-cases/consultar-estado-optimizacion.use-case';
import { OPTIMIZACION_PORT } from './domain/ports/optimizacion.port';
import { PythonOptimizacionAdapter } from './infrastructure/adapters/python-optimizacion.adapter';

@Module({
  controllers: [PlanificacionController],
  providers: [
    {
      provide: OPTIMIZACION_PORT,
      useClass: PythonOptimizacionAdapter,
    },
    SolicitarOptimizacionUseCase,
    ConsultarEstadoOptimizacionUseCase,
  ],
})
export class PlanificacionesModule {}
