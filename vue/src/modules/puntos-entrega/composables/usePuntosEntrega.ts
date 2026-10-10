import { ref, computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { puntosEntregaService } from '../services/puntos-entrega.service';

export function usePuntosEntrega() {
  const queryParams = ref({
    page: 1,
    limit: 10,
    search: '',
    estado: undefined as string | undefined,
  });

  const { data, isFetching } = useQuery({
    queryKey: ['puntos-entrega', queryParams],
    queryFn: () => puntosEntregaService.listar({
      page: queryParams.value.page,
      limit: queryParams.value.limit,
      search: queryParams.value.search || undefined,
      estado: queryParams.value.estado || undefined,
    }),
  });

  const puntos = computed(() => data.value?.data || []);
  const totalRecords = computed(() => data.value?.meta?.total || 0);

  return {
    puntos,
    totalRecords,
    isFetching,
    queryParams
  };
}
