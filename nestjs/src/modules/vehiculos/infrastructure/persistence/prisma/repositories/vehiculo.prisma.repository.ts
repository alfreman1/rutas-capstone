import { Injectable } from '@nestjs/common';
import { VehiculoRepository, VehiculoQuery, PaginatedVehiculos } from '../../../../domain/repositories/vehiculo.repository';
import { Vehiculo } from '../../../../domain/entities/vehiculo.entity';
import { PrismaService } from '../../../../../../prisma/prisma.service';

@Injectable()
export class VehiculoPrismaRepository implements VehiculoRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(record: any): Vehiculo {
    return new Vehiculo(
      record.id,
      record.placa,
      record.codigo,
      record.tipo,
      Number(record.capacidadPesoKg || 0),
      Number(record.capacidadVolumenM3 || 0),
      record.estado,
      record.marca,
      record.modelo,
    );
  }

  async crear(vehiculo: Partial<Vehiculo>): Promise<Vehiculo> {
    const record = await this.prisma.vehiculo.create({
      data: {
        placa: vehiculo.placa!,
        codigo: vehiculo.codigo!,
        tipo: vehiculo.tipo as any,
        capacidadPesoKg: vehiculo.capacidadPesoKg,
        capacidadVolumenM3: vehiculo.capacidadVolumenM3,
        estado: vehiculo.estado as any,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
      },
    });
    return this.mapToDomain(record);
  }

  async buscarPorId(id: string): Promise<Vehiculo | null> {
    const record = await this.prisma.vehiculo.findUnique({ where: { id } });
    return record ? this.mapToDomain(record) : null;
  }

  async buscarPorPlaca(placa: string): Promise<Vehiculo | null> {
    const record = await this.prisma.vehiculo.findUnique({ where: { placa } });
    return record ? this.mapToDomain(record) : null;
  }

  async listar(query: VehiculoQuery): Promise<PaginatedVehiculos> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (query.search) {
      whereClause.OR = [
        { placa: { contains: query.search, mode: 'insensitive' } },
        { codigo: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.estado) {
      whereClause.estado = query.estado;
    }
    if (query.tipo) {
      whereClause.tipo = query.tipo;
    }

    const [total, records] = await this.prisma.$transaction([
      this.prisma.vehiculo.count({ where: whereClause }),
      this.prisma.vehiculo.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { placa: 'asc' },
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

  async actualizarEstado(id: string, estado: string): Promise<Vehiculo> {
    const record = await this.prisma.vehiculo.update({
      where: { id },
      data: { estado: estado as any },
    });
    return this.mapToDomain(record);
  }
}
