import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OptimizacionPort, OptimizacionRequest, OptimizacionResponse } from '../../domain/ports/optimizacion.port';
import axios, { AxiosInstance } from 'axios';
import { BusinessRuleException } from '../../../../shared/domain/exceptions/domain.exception';

@Injectable()
export class PythonOptimizacionAdapter implements OptimizacionPort {
  private readonly logger = new Logger(PythonOptimizacionAdapter.name);
  private readonly apiClient: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    const aiUrl = this.configService.get<string>('aiEngine.url');
    const aiTimeout = this.configService.get<number>('aiEngine.timeoutMs') || 30000;
    const aiApiKey = this.configService.get<string>('aiEngine.apiKey');

    this.apiClient = axios.create({
      baseURL: aiUrl,
      timeout: aiTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiApiKey}`, // Token interno de servicio a servicio
      },
    });
  }

  async solicitarOptimizacion(data: OptimizacionRequest): Promise<OptimizacionResponse> {
    try {
      this.logger.log(`Enviando solicitud de optimización para la Planificación [${data.planificacionId}] al Motor IA...`);
      
      const response = await this.apiClient.post('/api/v1/optimize/routes/jobs', data);
      
      return {
        jobId: response.data.job_id,
        estado: response.data.status,
      };
    } catch (error: any) {
      this.logger.error('Error al comunicarse con el Motor IA para iniciar optimización', error.message);
      
      // Aplicación de patrón Circuit Breaker manual / fail-fast
      if (error.code === 'ECONNREFUSED' || !error.response) {
        throw new BusinessRuleException('El motor de Inteligencia Artificial está temporalmente inalcanzable. Intente más tarde.', 'AI_ENGINE_DOWN');
      }

      throw new BusinessRuleException(`Error en el motor de IA: ${error.response?.data?.detail || error.message}`, 'AI_ENGINE_ERROR');
    }
  }

  async consultarEstado(jobId: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/api/v1/optimize/routes/jobs/${jobId}`);
      return response.data; // { status, result: {...metricas, rutas} }
    } catch (error: any) {
      this.logger.error(`Error al consultar estado del job [${jobId}]`, error.message);
      throw new BusinessRuleException('No se pudo verificar el estado en el Motor de IA.', 'AI_ENGINE_FETCH_ERROR');
    }
  }
}
