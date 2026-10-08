import { Usuario as PrismaUsuario, Rol as PrismaRol } from '@prisma/client';
import { Usuario, EstadoUsuario } from '../../../../domain/entities/usuario.entity';

type PrismaUsuarioWithRoles = PrismaUsuario & {
  usuarios?: { rol: PrismaRol }[];
};

export class UsuarioMapper {
  static toDomain(prismaUsuario: PrismaUsuarioWithRoles): Usuario {
    const roles = prismaUsuario.usuarios
      ? prismaUsuario.usuarios.map((ur) => ur.rol.nombre)
      : [];

    return new Usuario(
      prismaUsuario.id,
      prismaUsuario.nombre,
      prismaUsuario.email,
      prismaUsuario.estado as EstadoUsuario,
      prismaUsuario.password,
      roles,
      prismaUsuario.createdAt,
      prismaUsuario.updatedAt,
    );
  }
}
