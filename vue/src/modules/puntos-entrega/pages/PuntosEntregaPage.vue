<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Puntos de Entrega</h1>
        <p class="text-slate-500 text-sm mt-1">Gestión de clientes y direcciones de entrega</p>
      </div>
      <Button 
        label="Nuevo Punto" 
        icon="pi pi-plus" 
        class="p-button-primary mt-4 md:mt-0" 
        @click="showCreateModal = true"
      />
    </div>

    <!-- Filtros -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center">
      <div class="p-input-icon-left flex-1 min-w-[250px]">
        <i class="pi pi-search" />
        <InputText v-model="queryParams.search" placeholder="Buscar por código, nombre o dirección..." class="w-full" />
      </div>
      <Dropdown v-model="queryParams.estado" :options="estados" placeholder="Estado" class="w-48" />
      <Button icon="pi pi-times" severity="secondary" text @click="queryParams.search=''; queryParams.estado=undefined" v-tooltip="'Limpiar filtros'" />
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <DataTable 
        :value="puntos" 
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
          <div class="p-8 text-center text-slate-500">No se encontraron puntos de entrega.</div>
        </template>
        
        <Column field="codigo" header="Código" style="width: 15%"></Column>
        <Column field="nombre" header="Cliente/Nombre">
          <template #body="{ data }">
            <span class="font-medium text-slate-700">{{ data.nombre }}</span>
          </template>
        </Column>
        <Column field="direccion" header="Dirección">
          <template #body="{ data }">
            <span class="text-sm text-slate-600">
              <i class="pi pi-map-marker mr-1 text-slate-400"></i>
              {{ data.direccion }}
            </span>
          </template>
        </Column>
        <Column field="contrato" header="Contrato Asociado">
          <template #body="{ data }">
            <span class="text-sm font-semibold text-indigo-600">{{ data.contratoCodigo }}</span>
          </template>
        </Column>
        <Column field="estado" header="Estado" style="width: 10%">
          <template #body="{ data }">
            <Tag :value="data.estado" :severity="getSeverity(data.estado)"></Tag>
          </template>
        </Column>
        <Column header="Acciones" style="width: 10%">
          <template #body="{ data }">
            <div class="flex gap-2">
              <Button icon="pi pi-pencil" text rounded severity="secondary" v-tooltip="'Editar'" />
              <Button icon="pi pi-map" text rounded severity="info" v-tooltip="'Ver en Mapa'" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Modal Mock -->
    <Dialog v-model:visible="showCreateModal" modal header="Nuevo Punto de Entrega" :style="{ width: '500px' }">
      <div class="space-y-4 pt-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
          <InputText class="w-full" placeholder="Ej. Cliente Mayorista S.A." />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
          <InputText class="w-full" placeholder="Ej. Av. Principal 123" />
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
import { ref, computed } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import { usePuntosEntrega } from '../composables/usePuntosEntrega';

const estados = ['ACTIVO', 'INACTIVO'];
const showCreateModal = ref(false);

const { puntos, totalRecords, isFetching, queryParams } = usePuntosEntrega();

const onPage = (event: any) => {
  queryParams.value.page = event.page + 1;
  queryParams.value.limit = event.rows;
};

const getSeverity = (status: string) => {
  switch (status) {
    case 'ACTIVO': return 'success';
    case 'INACTIVO': return 'danger';
    default: return 'secondary';
  }
};
</script>
