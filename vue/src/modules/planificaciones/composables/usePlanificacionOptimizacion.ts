import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { planificacionService } from '../services/planificacion.service';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';

export function usePlanificacionOptimizacion(planificacionId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();
  
  // Mantenemos un flag si estamos activamente esperando a la IA
  const isPollingEnabled = ref(false);

  // Query principal para el estado de la IA
  const estadoQuery = useQuery({
    queryKey: ['planificacion', planificacionId, 'estado-optimizacion'],
    queryFn: () => planificacionService.consultarEstado(planificacionId),
    refetchInterval: (query) => {
      // Polling cada 3 segundos si el estado es PROCESANDO, PENDIENTE o GENERANDO y hemos habilitado el polling
      const estado = query.state?.data?.estado;
      if (isPollingEnabled.value && (estado === 'PROCESANDO' || estado === 'PENDIENTE' || estado === 'GENERANDO')) {
        return 3000; 
      }
      return false; // Detener polling
    },
    enabled: isPollingEnabled, // Solo se habilita si pedimos monitorearlo
  });

  // Mutación para disparar el cálculo
  const solicitarMutacion = useMutation({
    mutationFn: (payload: {vehiculosIds: string[], algoritmo?: string}) => planificacionService.solicitarOptimizacion(planificacionId, payload.vehiculosIds, payload.algoritmo),
    onSuccess: () => {
      toast.add({ severity: 'info', summary: 'Optimizador iniciado', detail: 'La Inteligencia Artificial está calculando las rutas.', life: 5000 });
      isPollingEnabled.value = true; // Empezamos a hacer polling automático
      // Invalidar query si hubiere
      queryClient.invalidateQueries({ queryKey: ['planificacion', planificacionId] });
    },
    onError: (error: any) => {
      // The toast is also handled globally, but we keep this just in case, or we rely on the global one.
      isPollingEnabled.value = false;
    }
  });

  return {
    estadoOptimizacion: estadoQuery.data,
    isPolling: estadoQuery.isFetching,
    solicitarOptimizacion: solicitarMutacion.mutate,
    isSolicitando: solicitarMutacion.isPending,
    isErrorSolicitud: solicitarMutacion.isError,
    isPollingEnabled,
    consultarEstadoManual: estadoQuery.refetch,
  };
}
