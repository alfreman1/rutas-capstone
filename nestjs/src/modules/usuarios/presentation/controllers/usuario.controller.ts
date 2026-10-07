import { Controller, Get, Query, Injectable, Module } from '@nestjs/common';
import { ListarUsuariosUseCase } from '../application/use-cases/listar-usuarios.use-case';
import { PaginationParamsDto } from '../../../shared/application/dto/pagination-params.dto';
import { Roles, Public } from '../../../shared/decorators/auth.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Usuarios')
@Controller('usuarios')
@ApiBearerAuth()
export class UsuarioController {
  constructor(private readonly listarUsuariosUseCase: ListarUsuariosUseCase) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar usuarios (solo Admin)' })
  async listar(@Query() params: PaginationParamsDto) {
    return await this.listarUsuariosUseCase.execute(params);
  }
}
