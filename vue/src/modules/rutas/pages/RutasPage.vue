<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Rutas de Despacho</h1>
        <p class="text-slate-500 text-sm mt-1">Gestión y seguimiento de rutas asignadas a los vehículos</p>
      </div>
      <div class="flex gap-2">
        <Button icon="pi pi-refresh" label="Actualizar" outlined />
      </div>
    </div>

    <!-- Filtros Básicos -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4 items-center">
      <span class="p-input-icon-left w-full md:w-96">
        <i class="pi pi-search" />
        <InputText v-model="filters.global.value" placeholder="Buscar por código de ruta..." class="w-full" />
      </span>
    </div>

    <!-- Tabla de Rutas -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <DataTable
        :value="rutas"
        :paginator="true"
        :rows="10"
        dataKey="id"
        :loading="isLoading"
        responsiveLayout="scroll"
        hoverableRows
      >
        <template #empty>
          <div class="text-center p-8 text-slate-500">
            <i class="pi pi-map text-4xl mb-4 text-slate-300"></i>
            <p>No se encontraron rutas generadas.</p>
          </div>
        </template>

        <Column field="codigo" header="Código Ruta" style="min-width: 12rem">
          <template #body="{ data }">
            <span class="font-medium text-slate-800">{{ data.codigo }}</span>
          </template>
        </Column>

        <Column field="vehiculo" header="Vehículo Asignado" style="min-width: 14rem">
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <i class="pi pi-truck text-slate-400"></i>
              <span>{{ data.vehiculo?.placa || 'Sin asignar' }}</span>
            </div>
          </template>
        </Column>

        <Column field="distancia" header="Distancia / Tiempo" style="min-width: 14rem">
          <template #body="{ data }">
            <div class="flex flex-col">
              <span class="text-sm"><i class="pi pi-map-marker text-blue-500 mr-1"></i> {{ data.distanciaKm || 0 }} km</span>
              <span class="text-xs text-slate-500"><i class="pi pi-clock mr-1"></i> {{ data.tiempoMinutos || 0 }} min</span>
            </div>
          </template>
        </Column>

        <Column field="estado" header="Estado" style="min-width: 10rem">
          <template #body="{ data }">
            <Tag :value="data.estado" :severity="getEstadoSeverity(data.estado)" />
          </template>
        </Column>

        <Column header="Acciones" :exportable="false" style="min-width: 8rem">
          <template #body="{ data }">
            <Button
              icon="pi pi-eye"
              outlined
              rounded
              severity="secondary"
              @click="$router.push(`/rutas/${data.id}`)"
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import { useRouter } from 'vue-router';

const router = useRouter();
const isLoading = ref(false);

const filters = ref({
  global: { value: null, matchMode: 'contains' }
});

// Datos mockeados por ahora para tener la UI lista
const rutas = ref([
  {
    id: '1',
    codigo: 'RUT-202610-001',
    vehiculo: { placa: 'ABC-123' },
    distanciaKm: 45.5,
    tiempoMinutos: 120,
    estado: 'EN_CURSO',
  },
  {
    id: '2',
    codigo: 'RUT-202610-002',
    vehiculo: { placa: 'XYZ-987' },
    distanciaKm: 12.3,
    tiempoMinutos: 45,
    estado: 'PENDIENTE',
  }
]);

const getEstadoSeverity = (estado: string) => {
  switch (estado) {
    case 'PENDIENTE': return 'warning';
    case 'EN_CURSO': return 'info';
    case 'FINALIZADA': return 'success';
    case 'CANCELADA': return 'danger';
    default: return 'secondary';
  }
};
</script>
