import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

export interface PlanificacionQuery {
  page: number;
  limit: number;
  search?: string;
  estado?: string;
}

@Injectable()
export class ListarPlanificacionesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: PlanificacionQuery) {
    const { page, limit, search, estado } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (estado) {
      where.estado = estado;
    }
    if (search) {
      where.codigo = { contains: search, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.planificacion.findMany({
        where,
        skip,
        take: limit,
      include: {
        jornada: {
          include: {
            demandas: {
              select: { id: true }
            }
          }
        }
      },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.planificacion.count({ where })
    ]);

    return {
      items: items.map(p => ({
        id: p.id,
        fecha: p.jornada?.fecha ? p.jornada.fecha.toISOString().split('T')[0] : 'N/A',
        estado: p.estado,
        puntos: p.jornada?.demandas?.length || 0,
      })),
      total,
      page,
      limit
    };
  }
}
