import { Injectable, Inject, Logger } from '@nestjs/common';
import { OPTIMIZACION_PORT, OptimizacionPort } from '../../domain/ports/optimizacion.port';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { BusinessRuleException, NotFoundDomainException } from '../../../../shared/domain/exceptions/domain.exception';

@Injectable()
export class SolicitarOptimizacionUseCase {
  private readonly logger = new Logger(SolicitarOptimizacionUseCase.name);

  constructor(
    @Inject(OPTIMIZACION_PORT)
    private readonly optimizacionPort: OptimizacionPort,
    private readonly prisma: PrismaService, // Direct Prisma used here for rapid scaffolding, ideally wrapped in Repositories
  ) {}

  async execute(planificacionId: string, vehiculosIds: string[]): Promise<any> {
    // 1. Validaciones Iniciales
    const planificacion = await this.prisma.planificacion.findUnique({
      where: { id: planificacionId },
      include: { jornada: true },
    });

    if (!planificacion) {
      throw new NotFoundDomainException(`Planificación con ID ${planificacionId} no encontrada.`);
    }

    if (planificacion.estado !== 'BORRADOR' && planificacion.estado !== 'ERROR') {
      throw new BusinessRuleException(`No se puede optimizar una planificación en estado: ${planificacion.estado}`);
    }

    // 2. Recopilar datos: Vehículos disponibles
    const vehiculos = await this.prisma.vehiculo.findMany({
      where: {
        id: { in: vehiculosIds },
        estado: 'ACTIVO',
      },
    });

    if (vehiculos.length === 0) {
      throw new BusinessRuleException('Debe seleccionar al menos un vehículo activo para la optimización.');
    }

    // 3. Recopilar datos: Demandas y Puntos de la Jornada
    const demandas = await this.prisma.demanda.findMany({
      where: { jornadaId: planificacion.jornadaId },
      include: {
        puntoEntrega: {
          include: { ventanas: true }
        },
        detalles: {
          include: { producto: true } // Para extraer pesos/volúmenes (mockeado aquí para simplicidad)
        }
      }
    });

    if (demandas.length === 0) {
      throw new BusinessRuleException('La jornada no tiene demandas registradas para optimizar.');
    }

    // 4. Transformar a la Matriz (DTO) que espera Python
    const puntosEntrega = demandas.map(demanda => {
      // Mock simple de consolidación de peso/volumen (en un sistema real se suma por producto/presentación)
      const pesoTotal = demanda.detalles.reduce((acc, det) => acc + Number(det.cantidad), 0) * 1.5; 
      const volumenTotal = demanda.detalles.reduce((acc, det) => acc + Number(det.cantidad), 0) * 0.1;

      return {
        id: demanda.puntoEntrega.id,
        latitud: Number(demanda.puntoEntrega.latitud),
        longitud: Number(demanda.puntoEntrega.longitud),
        tiempoServicioMinutos: demanda.puntoEntrega.tiempoServicioMinutos,
        ventanas: demanda.puntoEntrega.ventanas.map(v => ({
          inicio: v.horaInicio,
          fin: v.horaFin,
        })),
        demandas: [{ productoId: 'mock', pesoTotal, volumenTotal }],
      };
    });

    const vehiculosPayload = vehiculos.map(v => ({
      id: v.id,
      capacidadPesoKg: Number(v.capacidadPesoKg || 1000),
      capacidadVolumenM3: Number(v.capacidadVolumenM3 || 10),
    }));

    // 5. Cambiar el estado a PROCESANDO
    await this.prisma.planificacion.update({
      where: { id: planificacionId },
      data: { estado: 'PROCESANDO' }
    });

    // 6. Comunicarse con FastAPI
    try {
      const iaResponse = await this.optimizacionPort.solicitarOptimizacion({
        planificacionId,
        jornadaId: planificacion.jornadaId,
        puntosEntrega,
        vehiculos: vehiculosPayload,
        restricciones: { tiempoMaximoRutaMinutos: 480 }, // 8 horas max
      });

      // 7. Persistir el Job ID en una tabla Optimizacion para trazarlo
      const optimizacion = await this.prisma.optimizacion.create({
        data: {
          planificacionId,
          algoritmo: 'OR-Tools VRPTW',
          estado: 'PROCESANDO',
          resultado: { jobId: iaResponse.jobId },
          iniciadoAt: new Date(),
        }
      });

      return {
        success: true,
        message: 'La optimización ha iniciado en segundo plano.',
        jobId: iaResponse.jobId,
        optimizacionId: optimizacion.id,
      };

    } catch (error) {
      // Revertir a ERROR si falla el envío
      await this.prisma.planificacion.update({
        where: { id: planificacionId },
        data: { estado: 'ERROR' }
      });
      throw error;
    }
  }
}
