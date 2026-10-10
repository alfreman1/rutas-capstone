import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

interface QueryParams {
  page: number;
  limit: number;
  search?: string;
  estado?: string;
}

@Injectable()
export class ListarJornadasUseCase {
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
        { 
          contrato: { 
            codigo: { contains: search, mode: 'insensitive' } 
          }
        },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.jornada.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          contrato: {
            select: { codigo: true, nombre: true }
          },
          _count: {
            select: { demandas: true, planificaciones: true }
          }
        }
      }),
      this.prisma.jornada.count({ where }),
    ]);

    const mappedItems = items.map(item => ({
      id: item.id,
      codigo: item.codigo,
      fecha: item.fecha.toISOString().split('T')[0],
      estado: item.estado,
      contratoCodigo: item.contrato?.codigo,
      contratoNombre: item.contrato?.nombre,
      demandasCount: item._count.demandas,
      planificacionesCount: item._count.planificaciones,
    }));

    return {
      items: mappedItems,
      total,
      page,
      limit,
    };
  }
}
