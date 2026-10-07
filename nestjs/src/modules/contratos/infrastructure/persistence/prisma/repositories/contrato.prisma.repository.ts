import { Injectable } from '@nestjs/common';
import { ContratoRepository, ContratoQuery, PaginatedResult } from '../../../domain/repositories/contrato.repository';
import { Contrato } from '../../../domain/entities/contrato.entity';
import { PrismaService } from '../../../../../../prisma/prisma.service';

@Injectable()
export class ContratoPrismaRepository implements ContratoRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(record: any): Contrato {
    return new Contrato(
      record.id,
      record.codigo,
      record.nombre,
      record.fechaInicio,
      record.estado,
      record.descripcion,
      record.fechaFin,
      record.createdAt,
      record.updatedAt,
    );
  }

  async crear(contrato: Partial<Contrato>): Promise<Contrato> {
    const data = {
      codigo: contrato.codigo!,
      nombre: contrato.nombre!,
      descripcion: contrato.descripcion,
      fechaInicio: contrato.fechaInicio || new Date(),
      fechaFin: contrato.fechaFin,
      estado: contrato.estado || 'BORRADOR',
    };
    
    const record = await this.prisma.contrato.create({ data });
    return this.mapToDomain(record);
  }

  async buscarPorId(id: string): Promise<Contrato | null> {
    const record = await this.prisma.contrato.findUnique({ where: { id } });
    return record ? this.mapToDomain(record) : null;
  }

  async buscarPorCodigo(codigo: string): Promise<Contrato | null> {
    const record = await this.prisma.contrato.findUnique({ where: { codigo } });
    return record ? this.mapToDomain(record) : null;
  }

  async listar(query: ContratoQuery): Promise<PaginatedResult<Contrato>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (query.search) {
      whereClause.OR = [
        { codigo: { contains: query.search, mode: 'insensitive' } },
        { nombre: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.estado) {
      whereClause.estado = query.estado;
    }

    const [total, records] = await this.prisma.$transaction([
      this.prisma.contrato.count({ where: whereClause }),
      this.prisma.contrato.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      items: records.map(this.mapToDomain),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async actualizar(id: string, contrato: Partial<Contrato>): Promise<Contrato> {
    const record = await this.prisma.contrato.update({
      where: { id },
      data: {
        nombre: contrato.nombre,
        descripcion: contrato.descripcion,
        fechaInicio: contrato.fechaInicio,
        fechaFin: contrato.fechaFin,
        estado: contrato.estado as any,
      },
    });
    return this.mapToDomain(record);
  }
}
