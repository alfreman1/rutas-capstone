import { ref, computed } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { contratoService, ContratosParams, PuntoEntrega } from '../services/contrato.service';
import { useToast } from 'primevue/usetoast';

export function useContratos() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const queryParams = ref<ContratosParams>({
    page: 1,
    limit: 10,
    search: '',
  });

  // Query de contratos
  const contratosQuery = useQuery({
    queryKey: computed(() => ['contratos', queryParams.value.page, queryParams.value.limit, queryParams.value.search, queryParams.value.estado]),
    queryFn: () => contratoService.listar(queryParams.value),
  });

  // Mutación crear contrato
  const crearContratoMut = useMutation({
    mutationFn: contratoService.crear,
    onSuccess: () => {
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Contrato creado', life: 3000 });
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
    },
    onError: (err: any) => {
      toast.add({ severity: 'error', summary: 'Error', detail: err?.response?.data?.message || 'Error al crear contrato', life: 5000 });
    }
  });

  return {
    contratos: computed(() => contratosQuery.data.value?.data || []),
    totalRecords: computed(() => contratosQuery.data.value?.meta?.total || 0),
    isFetching: contratosQuery.isFetching,
    queryParams,
    crearContrato: crearContratoMut.mutateAsync,
    isCreando: crearContratoMut.isPending,
  };
}

export function usePuntosEntrega(contratoId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const puntosQuery = useQuery({
    queryKey: ['contrato', contratoId, 'puntos'],
    queryFn: () => contratoService.listarPuntos(contratoId),
    enabled: !!contratoId,
  });

  const crearPuntoMut = useMutation({
    mutationFn: (data: Partial<PuntoEntrega>) => contratoService.agregarPunto(contratoId, data),
    onSuccess: () => {
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Punto de entrega agregado', life: 3000 });
      queryClient.invalidateQueries({ queryKey: ['contrato', contratoId, 'puntos'] });
    },
    onError: (err: any) => {
      toast.add({ severity: 'error', summary: 'Error', detail: err?.response?.data?.message || 'Error al agregar punto', life: 5000 });
    }
  });

  return {
    puntos: computed(() => puntosQuery.data.value?.data || []),
    isFetching: puntosQuery.isFetching,
    agregarPunto: crearPuntoMut.mutateAsync,
    isCreando: crearPuntoMut.isPending,
  };
}
