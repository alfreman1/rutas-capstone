import { Usuario } from '../entities/usuario.entity';
import { PaginatedResult } from '../../../../shared/application/dto/paginated-result.dto';

export const USUARIO_REPOSITORY = Symbol('USUARIO_REPOSITORY');

export interface UsuarioRepository {
  crear(usuario: Usuario): Promise<Usuario>;
  buscarPorId(id: string): Promise<Usuario | null>;
  buscarPorEmail(email: string): Promise<Usuario | null>;
  actualizar(id: string, usuario: Partial<Usuario>): Promise<Usuario>;
  eliminar(id: string): Promise<void>;
  listar(params: any): Promise<PaginatedResult<Usuario>>;
}
