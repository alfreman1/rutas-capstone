import { Injectable } from '@nestjs/common';
import { UsuarioRepository } from '../../../domain/repositories/usuario.repository';
import { PrismaService } from '../../../../../../prisma/prisma.service';
import { Usuario, EstadoUsuario } from '../../../domain/entities/usuario.entity';
import { UsuarioMapper } from '../mappers/usuario.mapper';
import { PaginatedResult } from '../../../../../../shared/application/dto/paginated-result.dto';
import { PaginationHelper } from '../../../../../../shared/helpers/pagination.helper';

@Injectable()
export class UsuarioPrismaRepository implements UsuarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async crear(usuario: Usuario): Promise<Usuario> {
    const data: any = {
      nombre: usuario.nombre,
      email: usuario.email,
      password: usuario.password!,
      estado: usuario.estado,
    };

    if (usuario.roles && usuario.roles.length > 0) {
      const roles = await this.prisma.rol.findMany({
        where: { nombre: { in: usuario.roles } },
      });
      data.usuarios = {
        create: roles.map((r) => ({ rolId: r.id })),
      };
    }

    const saved = await this.prisma.usuario.create({
      data,
      include: { usuarios: { include: { rol: true } } },
    });

    return UsuarioMapper.toDomain(saved);
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    const result = await this.prisma.usuario.findUnique({
      where: { id },
      include: { usuarios: { include: { rol: true } } },
    });
    if (!result) return null;
    return UsuarioMapper.toDomain(result);
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const result = await this.prisma.usuario.findUnique({
      where: { email },
      include: { usuarios: { include: { rol: true } } },
    });
    if (!result) return null;
    return UsuarioMapper.toDomain(result);
  }

  async actualizar(id: string, usuario: Partial<Usuario>): Promise<Usuario> {
    const result = await this.prisma.usuario.update({
      where: { id },
      data: {
        nombre: usuario.nombre,
        estado: usuario.estado,
      },
      include: { usuarios: { include: { rol: true } } },
    });
    return UsuarioMapper.toDomain(result);
  }

  async eliminar(id: string): Promise<void> {
    await this.prisma.usuario.update({
      where: { id },
      data: { estado: 'INACTIVO' },
    });
  }

  async listar(params: any): Promise<PaginatedResult<Usuario>> {
    const { skip, take } = PaginationHelper.getSkipTake(params.page, params.limit);

    const where: any = {};
    if (params.search) {
      where.OR = [
        { nombre: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.estado) {
      where.estado = params.estado;
    }

    const orderBy: any = {};
    if (params.sortBy) {
      orderBy[params.sortBy] = params.sortOrder || 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [total, data] = await Promise.all([
      this.prisma.usuario.count({ where }),
      this.prisma.usuario.findMany({
        where,
        skip,
        take,
        orderBy,
        include: { usuarios: { include: { rol: true } } },
      }),
    ]);

    const items = data.map((d) => UsuarioMapper.toDomain(d));
    return PaginationHelper.createPaginatedResult(items, total, params.page, params.limit);
  }
}
