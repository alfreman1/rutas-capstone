import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

interface QueryParams {
  page: number;
  limit: number;
  search?: string;
  estado?: string;
}

@Injectable()
export class ListarTodosPuntosEntregaUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: QueryParams) {
    const { page, limit, search, estado } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (estado) {
      where.estado = estado;
    }

    if (search) {
      where.OR = [
        { codigo: { contains: search, mode: 'insensitive' } },
        { nombre: { contains: search, mode: 'insensitive' } },
        { direccion: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.puntoEntregaContrato.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          contrato: {
            select: {
              codigo: true,
            }
          }
        }
      }),
      this.prisma.puntoEntregaContrato.count({ where }),
    ]);

    // Map output for frontend
    const mappedItems = items.map(item => ({
      id: item.id,
      codigo: item.codigo,
      nombre: item.nombre,
      direccion: item.direccion,
      contratoCodigo: item.contrato?.codigo,
      latitud: item.latitud,
      longitud: item.longitud,
      estado: item.estado,
    }));

    return {
      items: mappedItems,
      total,
      page,
      limit,
    };
  }
}
