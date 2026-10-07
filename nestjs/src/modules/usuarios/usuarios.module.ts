import { Module } from '@nestjs/common';
import { USUARIO_REPOSITORY } from './domain/repositories/usuario.repository';
import { UsuarioPrismaRepository } from './infrastructure/persistence/prisma/repositories/usuario.prisma.repository';
import { ListarUsuariosUseCase } from './application/use-cases/listar-usuarios.use-case';
import { UsuarioController } from './presentation/controllers/usuario.controller';

@Module({
  controllers: [UsuarioController],
  providers: [
    {
      provide: USUARIO_REPOSITORY,
      useClass: UsuarioPrismaRepository,
    },
    ListarUsuariosUseCase,
  ],
  exports: [USUARIO_REPOSITORY],
})
export class UsuariosModule {}
