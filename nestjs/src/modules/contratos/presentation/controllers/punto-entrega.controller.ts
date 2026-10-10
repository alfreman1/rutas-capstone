import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../../../../shared/decorators/auth.decorator';
import { ListarTodosPuntosEntregaUseCase } from '../../application/use-cases/listar-todos-puntos-entrega.use-case';
import { PaginationHelper } from '../../../../shared/helpers/pagination.helper';

@ApiTags('Comercial / Puntos de Entrega')
@Controller('puntos-entrega')
@ApiBearerAuth()
export class PuntoEntregaController {
  constructor(
    private readonly listarTodosPuntosEntregaUseCase: ListarTodosPuntosEntregaUseCase,
  ) {}

  @Get()
  @Roles('ADMIN', 'DISPATCHER')
  @ApiOperation({ summary: 'Lista todos los puntos de entrega globalmente con paginación' })
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
    const result = await this.listarTodosPuntosEntregaUseCase.execute({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      search,
      estado,
    });

    return PaginationHelper.createPaginatedResult(result.items, result.total, result.page, result.limit);
  }
}
