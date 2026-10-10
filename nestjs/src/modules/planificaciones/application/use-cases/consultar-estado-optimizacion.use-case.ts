import { Injectable, Inject, Logger } from '@nestjs/common';
import { OPTIMIZACION_PORT, OptimizacionPort } from '../../domain/ports/optimizacion.port';
import { PrismaService } from '../../../../prisma/prisma.service';
import { NotFoundDomainException } from '../../../../shared/domain/exceptions/domain.exception';

@Injectable()
export class ConsultarEstadoOptimizacionUseCase {
  private readonly logger = new Logger(ConsultarEstadoOptimizacionUseCase.name);

  constructor(
    @Inject(OPTIMIZACION_PORT)
    private readonly optimizacionPort: OptimizacionPort,
    private readonly prisma: PrismaService,
  ) {}

  async execute(planificacionId: string): Promise<any> {
    // 1. Buscar la optimización activa de esta planificación
    const optimizacion = await this.prisma.optimizacion.findFirst({
      where: { planificacionId },
      orderBy: { createdAt: 'desc' },
    });

    if (!optimizacion) {
      throw new NotFoundDomainException(`No hay una optimización en curso para la planificación ${planificacionId}`);
    }

    // Si ya terminó o falló en base de datos, retornamos inmediatamente sin ir a Python
    if (optimizacion.estado === 'COMPLETADA' || optimizacion.estado === 'ERROR') {
      return { 
        estado: optimizacion.estado, 
        resultado: optimizacion.estado === 'COMPLETADA' ? optimizacion.resultado : null,
        error: optimizacion.estado === 'ERROR' ? (optimizacion.resultado as any)?.error : null
      };
    }

    const payloadRaw = optimizacion.resultado as any;
    const jobId = payloadRaw?.jobId;

    if (!jobId) {
      throw new NotFoundDomainException('El Job ID no está presente en el registro de la optimización.');
    }

    // 2. Consultar el motor de IA vía el adaptador
    let iaResponse: any;
    try {
      iaResponse = await this.optimizacionPort.consultarEstado(jobId);
    } catch (error: any) {
      this.logger.error(`Error de red/comunicación al consultar el Job [${jobId}]`, error.message);
      
      // Registrar el error de polling en DB
      await this.prisma.optimizacion.update({
        where: { id: optimizacion.id },
        data: {
          estado: 'ERROR',
          finalizadoAt: new Date(),
          resultado: { jobId, error: error.message || 'Error de conexión con la IA al consultar estado' }
        }
      });

      await this.prisma.planificacion.update({
        where: { id: planificacionId },
        data: { estado: 'ERROR' }
      });

      return {
        estado: 'ERROR',
        error: error.message || 'Error de conexión con la IA'
      };
    }

    // 3. Si hubo un cambio de estado en la IA, actualizar PostgreSQL (NestJS)
    if (iaResponse.status === 'COMPLETADA') {
      this.logger.log(`El Job [${jobId}] ha finalizado. Actualizando DB...`);
      
      // Actualizamos la Optimizacion
      await this.prisma.optimizacion.update({
        where: { id: optimizacion.id },
        data: {
          estado: 'COMPLETADA',
          finalizadoAt: new Date(),
          resultado: {
            jobId,
            ...iaResponse.result
          }
        }
      });

      // Actualizamos la Planificacion (ya tiene rutas listas para revisión humana)
      await this.prisma.planificacion.update({
        where: { id: planificacionId },
        data: { estado: 'GENERADA' }
      });
      
    } else if (iaResponse.status === 'ERROR' || iaResponse.status === 'FAILED') {
      this.logger.error(`El Job [${jobId}] falló en la IA.`);
      
      await this.prisma.optimizacion.update({
        where: { id: optimizacion.id },
        data: {
          estado: 'ERROR',
          finalizadoAt: new Date(),
          resultado: { jobId, error: iaResponse.error_detail || iaResponse.error || 'Fallo interno del algoritmo IA' }
        }
      });

      await this.prisma.planificacion.update({
        where: { id: planificacionId },
        data: { estado: 'ERROR' }
      });
    }

    return {
      estado: iaResponse.status === 'FAILED' ? 'ERROR' : iaResponse.status,
      resultado: iaResponse.status === 'COMPLETADA' ? iaResponse.result : null,
      error: (iaResponse.status === 'ERROR' || iaResponse.status === 'FAILED') 
             ? (iaResponse.error_detail || iaResponse.error || 'Error interno') 
             : null
    };
  }
}
