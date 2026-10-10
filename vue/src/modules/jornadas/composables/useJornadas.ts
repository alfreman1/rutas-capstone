import { ref, computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { jornadasService } from '../services/jornadas.service';

export function useJornadas() {
  const queryParams = ref({
    page: 1,
    limit: 10,
    search: '',
    estado: undefined as string | undefined,
  });

  const { data, isFetching } = useQuery({
    queryKey: ['jornadas', queryParams],
    queryFn: () => jornadasService.listar({
      page: queryParams.value.page,
      limit: queryParams.value.limit,
      search: queryParams.value.search || undefined,
      estado: queryParams.value.estado || undefined,
    }),
  });

  const jornadas = computed(() => data.value?.data || []);
  const totalRecords = computed(() => data.value?.meta?.total || 0);

  return {
    jornadas,
    totalRecords,
    isFetching,
    queryParams
  };
}
