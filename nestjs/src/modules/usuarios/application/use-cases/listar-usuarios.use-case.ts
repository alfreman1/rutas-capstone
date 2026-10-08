import { Injectable, Inject } from '@nestjs/common';
import { USUARIO_REPOSITORY, UsuarioRepository } from '../../domain/repositories/usuario.repository';
import { PaginationParamsDto } from '../../../../shared/application/dto/pagination-params.dto';
import { PaginatedResult } from '../../../../shared/application/dto/paginated-result.dto';
import { Usuario } from '../../domain/entities/usuario.entity';

@Injectable()
export class ListarUsuariosUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  async execute(params: PaginationParamsDto & { estado?: string }): Promise<PaginatedResult<Partial<Usuario>>> {
    const result = await this.usuarioRepository.listar(params);
    
    // Quitamos los passwords del resultado
    result.data = result.data.map(user => {
      const { password, ...safeUser } = user;
      return safeUser as Partial<Usuario>;
    }) as any;

    return result as PaginatedResult<Partial<Usuario>>;
  }
}
