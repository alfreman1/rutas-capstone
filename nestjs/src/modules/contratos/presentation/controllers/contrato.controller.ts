import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../../../shared/decorators/auth.decorator';
import { CrearContratoUseCase } from '../application/use-cases/crear-contrato.use-case';
import { ListarContratosUseCase } from '../application/use-cases/listar-contratos.use-case';
import { CrearPuntoEntregaUseCase } from '../application/use-cases/crear-punto-entrega.use-case';
import { ListarPuntosEntregaUseCase } from '../application/use-cases/listar-puntos-entrega.use-case';
import { CrearContratoDto } from '../application/dto/crear-contrato.dto';
import { CrearPuntoEntregaDto } from '../application/dto/crear-punto-entrega.dto';
import { PaginationHelper } from '../../../shared/presentation/helpers/pagination.helper';

@ApiTags('Comercial / Contratos')
@Controller('contratos')
@ApiBearerAuth()
export class ContratoController {
  constructor(
    private readonly crearContratoUseCase: CrearContratoUseCase,
    private readonly listarContratosUseCase: ListarContratosUseCase,
    private readonly crearPuntoEntregaUseCase: CrearPuntoEntregaUseCase,
    private readonly listarPuntosEntregaUseCase: ListarPuntosEntregaUseCase,
  ) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crea un nuevo contrato en estado BORRADOR' })
  async crear(@Body() dto: CrearContratoDto) {
    return await this.crearContratoUseCase.execute(dto);
  }

  @Get()
  @Roles('ADMIN', 'DISPATCHER')
  @ApiOperation({ summary: 'Lista contratos con filtros y paginación' })
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
    const result = await this.listarContratosUseCase.execute({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      search,
      estado,
    });

    return PaginationHelper.formatResponse(result.items, result.total, result.page, result.limit);
  }

  @Post(':id/puntos-entrega')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Añade un nuevo punto de entrega a un contrato existente' })
  async crearPuntoEntrega(
    @Param('id') contratoId: string,
    @Body() dto: CrearPuntoEntregaDto,
  ) {
    return await this.crearPuntoEntregaUseCase.execute(contratoId, dto);
  }

  @Get(':id/puntos-entrega')
  @Roles('ADMIN', 'DISPATCHER')
  @ApiOperation({ summary: 'Lista todos los puntos de entrega de un contrato' })
  async listarPuntosEntrega(@Param('id') contratoId: string) {
    return await this.listarPuntosEntregaUseCase.execute(contratoId);
  }
}
