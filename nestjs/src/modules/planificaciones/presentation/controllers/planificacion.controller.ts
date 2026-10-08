import { Controller, Post, Param, Body, Get } from '@nestjs/common';
import { SolicitarOptimizacionUseCase } from '../../application/use-cases/solicitar-optimizacion.use-case';
import { ConsultarEstadoOptimizacionUseCase } from '../../application/use-cases/consultar-estado-optimizacion.use-case';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../../../../shared/decorators/auth.decorator';
import { ListarPlanificacionesUseCase } from '../../application/use-cases/listar-planificaciones.use-case';
import { PaginationHelper } from '../../../../shared/helpers/pagination.helper';
import { Query } from '@nestjs/common';

@ApiTags('Planificaciones / IA')
@Controller('planificaciones')
@ApiBearerAuth()
export class PlanificacionController {
  constructor(
    private readonly solicitarOptimizacionUseCase: SolicitarOptimizacionUseCase,
    private readonly consultarEstadoOptimizacionUseCase: ConsultarEstadoOptimizacionUseCase,
    private readonly listarPlanificacionesUseCase: ListarPlanificacionesUseCase,
  ) {}

  @Get()
  @Roles('ADMIN', 'DISPATCHER')
  @ApiOperation({ summary: 'Listar planificaciones con filtros y paginación' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'estado', required: false, type: String })
  async listar(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('estado') estado?: string,
  ) {
    const result = await this.listarPlanificacionesUseCase.execute({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      search,
      estado,
    });
    return PaginationHelper.createPaginatedResult(result.items, result.total, result.page, result.limit);
  }

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
        },
        algoritmo: {
          type: 'string',
          example: 'KMEANS_ORTOOLS'
        }
      }
    }
  })
  async optimizarRutas(
    @Param('id') planificacionId: string,
    @Body('vehiculosIds') vehiculosIds: string[],
    @Body('algoritmo') algoritmo?: string,
  ) {
    return await this.solicitarOptimizacionUseCase.execute(planificacionId, vehiculosIds, algoritmo);
  }

  @Get(':id/estado')
  @Roles('ADMIN', 'DISPATCHER')
  @ApiOperation({ summary: 'Consulta el estado actual de la optimización en el Motor de IA' })
  async obtenerEstadoOptimizacion(@Param('id') planificacionId: string) {
    return await this.consultarEstadoOptimizacionUseCase.execute(planificacionId);
  }
}
