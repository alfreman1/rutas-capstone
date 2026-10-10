import { ref, computed } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { planificacionService } from '../services/planificacion.service';
import { useToast } from 'primevue/usetoast';

export interface PlanificacionesParams {
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
}

export function usePlanificaciones() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const queryParams = ref<PlanificacionesParams>({
    page: 1,
    limit: 10,
    search: '',
  });

  const planificacionesQuery = useQuery({
    queryKey: computed(() => ['planificaciones', queryParams.value.page, queryParams.value.limit, queryParams.value.search, queryParams.value.estado]),
    queryFn: () => planificacionService.listar(queryParams.value),
  });

  return {
    planificaciones: computed(() => {
      console.log('Query Data:', planificacionesQuery.data.value);
      return planificacionesQuery.data.value?.data || [];
    }),
    totalRecords: computed(() => planificacionesQuery.data.value?.meta?.total || 0),
    isFetching: planificacionesQuery.isFetching,
    queryParams,
  };
}
