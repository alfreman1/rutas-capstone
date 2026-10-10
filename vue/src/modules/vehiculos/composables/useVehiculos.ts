import { ref, computed } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { vehiculoService, VehiculosParams } from '../services/vehiculo.service';
import { useToast } from 'primevue/usetoast';

export function useVehiculos() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const queryParams = ref<VehiculosParams>({
    page: 1,
    limit: 10,
    search: '',
  });

  const { data, isFetching } = useQuery({
    queryKey: ['vehiculos', queryParams],
    queryFn: () => vehiculoService.listar(queryParams.value),
  });

  const crearMutation = useMutation({
    mutationFn: vehiculoService.crear,
    onSuccess: () => {
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Vehículo registrado correctamente', life: 3000 });
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
    },
    onError: (err: any) => {
      toast.add({ severity: 'error', summary: 'Error', detail: err?.response?.data?.message || 'Error al registrar vehículo', life: 5000 });
    }
  });

  return {
    vehiculos: computed(() => data.value?.data || []),
    totalRecords: computed(() => data.value?.meta?.total || 0),
    isFetching,
    queryParams,
    crearVehiculo: crearMutation.mutateAsync,
    isCreando: crearMutation.isPending,
  };
}
