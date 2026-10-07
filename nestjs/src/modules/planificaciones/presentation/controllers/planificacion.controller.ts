import { Controller, Post, Param, Body, Get } from '@nestjs/common';
import { SolicitarOptimizacionUseCase } from '../application/use-cases/solicitar-optimizacion.use-case';
import { ConsultarEstadoOptimizacionUseCase } from '../application/use-cases/consultar-estado-optimizacion.use-case';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Roles } from '../../../shared/decorators/auth.decorator';

@ApiTags('Planificaciones / IA')
@Controller('planificaciones')
@ApiBearerAuth()
export class PlanificacionController {
  constructor(
    private readonly solicitarOptimizacionUseCase: SolicitarOptimizacionUseCase,
    private readonly consultarEstadoOptimizacionUseCase: ConsultarEstadoOptimizacionUseCase,
  ) {}

  @Post(':id/optimizar')
  @Roles('ADMIN', 'DISPATCHER')
  @ApiOperation({ summary: 'Envia los datos de la planificación al Motor de IA para su optimización' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        vehiculosIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['vehiculo-uuid-1', 'vehiculo-uuid-2']
        }
      }
    }
  })
  async optimizarRutas(
    @Param('id') planificacionId: string,
    @Body('vehiculosIds') vehiculosIds: string[],
  ) {
    return await this.solicitarOptimizacionUseCase.execute(planificacionId, vehiculosIds);
  }

  @Get(':id/estado')
  @Roles('ADMIN', 'DISPATCHER')
  @ApiOperation({ summary: 'Consulta el estado actual de la optimización en el Motor de IA' })
  async obtenerEstadoOptimizacion(@Param('id') planificacionId: string) {
    return await this.consultarEstadoOptimizacionUseCase.execute(planificacionId);
  }
}
