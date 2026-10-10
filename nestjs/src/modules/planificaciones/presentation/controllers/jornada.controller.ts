import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../../../../shared/decorators/auth.decorator';
import { ListarJornadasUseCase } from '../../application/use-cases/listar-jornadas.use-case';
import { PaginationHelper } from '../../../../shared/helpers/pagination.helper';

@ApiTags('Operaciones / Jornadas')
@Controller('jornadas')
@ApiBearerAuth()
export class JornadaController {
  constructor(
    private readonly listarJornadasUseCase: ListarJornadasUseCase,
  ) {}

  @Get()
  @Roles('ADMIN', 'DISPATCHER')
  @ApiOperation({ summary: 'Lista todas las jornadas globalmente con paginación' })
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
    const result = await this.listarJornadasUseCase.execute({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      search,
      estado,
    });

    return PaginationHelper.createPaginatedResult(result.items, result.total, result.page, result.limit);
  }
}
