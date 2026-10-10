<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Jornadas Operativas</h1>
        <p class="text-slate-500 text-sm mt-1">Gestión de días de operación por contrato</p>
      </div>
      <Button 
        label="Nueva Jornada" 
        icon="pi pi-plus" 
        class="p-button-primary mt-4 md:mt-0" 
        @click="showCreateModal = true"
      />
    </div>

    <!-- Filtros -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center">
      <div class="p-input-icon-left flex-1 min-w-[250px]">
        <i class="pi pi-search" />
        <InputText v-model="queryParams.search" placeholder="Buscar por código de jornada o contrato..." class="w-full" />
      </div>
      <Dropdown v-model="queryParams.estado" :options="estados" placeholder="Estado" class="w-48" />
      <Button icon="pi pi-times" severity="secondary" text @click="queryParams.search=''; queryParams.estado=undefined" v-tooltip="'Limpiar filtros'" />
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <DataTable 
        :value="jornadas" 
        :loading="isFetching"
        :paginator="true" 
        :rows="queryParams.limit" 
        :totalRecords="totalRecords"
        lazy
        @page="onPage($event)"
        class="p-datatable-sm"
        stripedRows
      >
        <template #empty>
          <div class="p-8 text-center text-slate-500">No se encontraron jornadas.</div>
        </template>
        
        <Column field="codigo" header="Código"></Column>
        <Column field="fecha" header="Fecha">
          <template #body="{ data }">
            <span class="font-medium text-slate-700">
              <i class="pi pi-calendar mr-2 text-slate-400"></i>{{ data.fecha }}
            </span>
          </template>
        </Column>
        <Column field="contrato" header="Contrato">
          <template #body="{ data }">
            <div>
              <span class="text-sm font-semibold text-indigo-600 block">{{ data.contratoCodigo }}</span>
              <span class="text-xs text-slate-500">{{ data.contratoNombre }}</span>
            </div>
          </template>
        </Column>
        <Column field="demandasCount" header="Demandas" style="text-align: center">
          <template #body="{ data }">
            <span class="text-sm font-medium">{{ data.demandasCount }}</span>
          </template>
        </Column>
        <Column field="planificacionesCount" header="Planificaciones" style="text-align: center">
          <template #body="{ data }">
            <span class="text-sm font-medium">{{ data.planificacionesCount }}</span>
          </template>
        </Column>
        <Column field="estado" header="Estado">
          <template #body="{ data }">
            <Tag :value="data.estado" :severity="getSeverity(data.estado)"></Tag>
          </template>
        </Column>
        <Column header="Acciones">
          <template #body="{ data }">
            <div class="flex gap-2">
              <Button icon="pi pi-eye" text rounded severity="info" v-tooltip="'Ver Detalle'" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Modal Mock -->
    <Dialog v-model:visible="showCreateModal" modal header="Abrir Nueva Jornada" :style="{ width: '400px' }">
      <div class="space-y-4 pt-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Contrato</label>
          <Dropdown class="w-full" placeholder="Seleccione un contrato..." />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
          <InputText type="date" class="w-full" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="showCreateModal = false" />
        <Button label="Guardar" icon="pi pi-check" @click="showCreateModal = false" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import { useJornadas } from '../composables/useJornadas';

const estados = ['ABIERTA', 'PLANIFICADA', 'EN_EJECUCION', 'FINALIZADA', 'CANCELADA'];
const showCreateModal = ref(false);

const { jornadas, totalRecords, isFetching, queryParams } = useJornadas();

const onPage = (event: any) => {
  queryParams.value.page = event.page + 1;
  queryParams.value.limit = event.rows;
};

const getSeverity = (status: string) => {
  switch (status) {
    case 'ABIERTA': return 'success';
    case 'PLANIFICADA': return 'info';
    case 'EN_EJECUCION': return 'warning';
    case 'FINALIZADA': return 'secondary';
    case 'CANCELADA': return 'danger';
    default: return 'secondary';
  }
};
</script>
