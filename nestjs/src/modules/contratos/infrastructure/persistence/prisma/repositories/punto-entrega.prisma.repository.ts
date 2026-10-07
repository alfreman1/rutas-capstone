import { Injectable } from '@nestjs/common';
import { PuntoEntregaRepository } from '../../../domain/repositories/punto-entrega.repository';
import { PuntoEntrega } from '../../../domain/entities/punto-entrega.entity';
import { VentanaEntrega } from '../../../domain/entities/ventana-entrega.entity';
import { PrismaService } from '../../../../../../prisma/prisma.service';

@Injectable()
export class PuntoEntregaPrismaRepository implements PuntoEntregaRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(record: any): PuntoEntrega {
    const ventanas = (record.ventanas || []).map((v: any) => 
      new VentanaEntrega(v.id, v.horaInicio, v.horaFin, v.estado, v.diaSemana)
    );

    return new PuntoEntrega(
      record.id,
      record.contratoId,
      record.codigo,
      record.nombre,
      Number(record.latitud),
      Number(record.longitud),
      record.tiempoServicioMinutos,
      record.estado,
      ventanas,
      record.direccion,
    );
  }

  async crear(puntoEntrega: Partial<PuntoEntrega>): Promise<PuntoEntrega> {
    const record = await this.prisma.puntoEntregaContrato.create({
      data: {
        contratoId: puntoEntrega.contratoId!,
        codigo: puntoEntrega.codigo!,
        nombre: puntoEntrega.nombre!,
        direccion: puntoEntrega.direccion,
        latitud: puntoEntrega.latitud!,
        longitud: puntoEntrega.longitud!,
        tiempoServicioMinutos: puntoEntrega.tiempoServicioMinutos || 10,
        estado: puntoEntrega.estado || 'ACTIVO',
        ventanas: {
          create: puntoEntrega.ventanas?.map(v => ({
            horaInicio: v.horaInicio,
            horaFin: v.horaFin,
            diaSemana: v.diaSemana,
            estado: v.estado,
          })) || []
        }
      },
      include: { ventanas: true }
    });

    return this.mapToDomain(record);
  }

  async buscarPorId(id: string): Promise<PuntoEntrega | null> {
    const record = await this.prisma.puntoEntregaContrato.findUnique({
      where: { id },
      include: { ventanas: true }
    });
    return record ? this.mapToDomain(record) : null;
  }

  async buscarPorCodigo(contratoId: string, codigo: string): Promise<PuntoEntrega | null> {
    const record = await this.prisma.puntoEntregaContrato.findFirst({
      where: { contratoId, codigo },
      include: { ventanas: true }
    });
    return record ? this.mapToDomain(record) : null;
  }

  async listarPorContrato(contratoId: string): Promise<PuntoEntrega[]> {
    const records = await this.prisma.puntoEntregaContrato.findMany({
      where: { contratoId },
      include: { ventanas: true },
      orderBy: { codigo: 'asc' }
    });
    return records.map(r => this.mapToDomain(r));
  }
}
