import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../../../shared/decorators/auth.decorator';
import { CrearVehiculoUseCase } from '../application/use-cases/crear-vehiculo.use-case';
import { ListarVehiculosUseCase } from '../application/use-cases/listar-vehiculos.use-case';
import { CrearVehiculoDto } from '../application/dto/crear-vehiculo.dto';
import { PaginationHelper } from '../../../shared/presentation/helpers/pagination.helper';

@ApiTags('Logística / Vehículos')
@Controller('vehiculos')
@ApiBearerAuth()
export class VehiculoController {
  constructor(
    private readonly crearVehiculoUseCase: CrearVehiculoUseCase,
    private readonly listarVehiculosUseCase: ListarVehiculosUseCase,
  ) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Registra un nuevo vehículo en la flota' })
  async crear(@Body() dto: CrearVehiculoDto) {
    return await this.crearVehiculoUseCase.execute(dto);
  }

  @Get()
  @Roles('ADMIN', 'DISPATCHER')
  @ApiOperation({ summary: 'Lista los vehículos con filtros y paginación' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'estado', required: false, type: String })
  @ApiQuery({ name: 'tipo', required: false, type: String })
  async listar(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('estado') estado?: string,
    @Query('tipo') tipo?: string,
  ) {
    const result = await this.listarVehiculosUseCase.execute({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      search,
      estado,
      tipo,
    });

    return PaginationHelper.formatResponse(result.items, result.total, result.page, result.limit);
  }
}
