<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Catálogo de Contratos</h1>
        <p class="text-slate-500 text-sm mt-1">Gestión de clientes y servicios logísticos</p>
      </div>
      <Button 
        label="Nuevo Contrato" 
        icon="pi pi-plus" 
        class="p-button-primary mt-4 md:mt-0" 
        @click="showCreateModal = true"
      />
    </div>

    <!-- Filtros -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center">
      <div class="p-input-icon-left flex-1 min-w-[250px]">
        <i class="pi pi-search" />
        <InputText v-model="search" placeholder="Buscar por código o nombre..." class="w-full" @keyup.enter="aplicarFiltros" />
      </div>
      <Select v-model="estadoFilter" :options="estados" placeholder="Estado" class="w-48" @change="aplicarFiltros" />
      <Button icon="pi pi-times" severity="secondary" text @click="limpiarFiltros" v-tooltip="'Limpiar filtros'" />
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <DataTable 
        :value="contratos" 
        :loading="isFetching" 
        lazy 
        :paginator="true" 
        :rows="queryParams.limit" 
        :totalRecords="totalRecords" 
        @page="onPage"
        class="p-datatable-sm"
        stripedRows
      >
        <template #empty>
          <div class="p-8 text-center text-slate-500">No se encontraron contratos.</div>
        </template>
        
        <Column field="codigo" header="Código" class="font-semibold"></Column>
        <Column field="nombre" header="Nombre del Contrato"></Column>
        <Column header="Vigencia">
          <template #body="{ data }">
            <span class="text-xs text-slate-500">
              <i class="pi pi-calendar mr-1"></i>
              {{ new Date(data.fechaInicio).toLocaleDateString() }} 
              <span v-if="data.fechaFin">- {{ new Date(data.fechaFin).toLocaleDateString() }}</span>
            </span>
          </template>
        </Column>
        <Column field="estado" header="Estado">
          <template #body="{ data }">
            <Tag :value="data.estado" :severity="getSeverity(data.estado)"></Tag>
          </template>
        </Column>
        <Column header="Acciones">
          <template #body="{ data }">
            <Button icon="pi pi-map" text rounded severity="info" v-tooltip="'Puntos de Entrega'" @click="$router.push(`/contratos/${data.id}`)"></Button>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Modal Crear -->
    <Dialog v-model:visible="showCreateModal" modal header="Nuevo Contrato" :style="{ width: '500px' }">
      <div class="space-y-4 pt-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Código de Contrato</label>
          <InputText v-model="form.codigo" class="w-full" placeholder="Ej. C-2026-001" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Nombre / Razón Social</label>
          <InputText v-model="form.nombre" class="w-full" placeholder="Ej. Distribución Zona Sur" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
          <Textarea v-model="form.descripcion" class="w-full" rows="3" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Fecha Inicio</label>
            <InputText type="date" v-model="form.fechaInicio" class="w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Fecha Fin (Opcional)</label>
            <InputText type="date" v-model="form.fechaFin" class="w-full" />
          </div>
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="showCreateModal = false" />
        <Button label="Guardar Contrato" icon="pi pi-check" @click="guardar" :loading="isCreando" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useContratos } from '../composables/useContratos';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';

const { contratos, totalRecords, isFetching, queryParams, crearContrato, isCreando } = useContratos();

const search = ref('');
const estadoFilter = ref<string | null>(null);
const estados = ['BORRADOR', 'ACTIVO', 'FINALIZADO', 'CANCELADO'];

const showCreateModal = ref(false);
const form = ref({
  codigo: '',
  nombre: '',
  descripcion: '',
  fechaInicio: new Date().toISOString().split('T')[0],
  fechaFin: '',
});

const aplicarFiltros = () => {
  queryParams.value.search = search.value;
  queryParams.value.estado = estadoFilter.value || undefined;
  queryParams.value.page = 1;
};

const limpiarFiltros = () => {
  search.value = '';
  estadoFilter.value = null;
  aplicarFiltros();
};

const onPage = (event: any) => {
  queryParams.value.page = event.page + 1;
};

const getSeverity = (status: string) => {
  switch (status) {
    case 'ACTIVO': return 'success';
    case 'BORRADOR': return 'secondary';
    case 'FINALIZADO': return 'info';
    case 'CANCELADO': return 'danger';
    default: return 'secondary';
  }
};

const guardar = async () => {
  const data: any = { ...form.value };
  if (data.fechaInicio) data.fechaInicio = new Date(data.fechaInicio).toISOString();
  if (data.fechaFin) data.fechaFin = new Date(data.fechaFin).toISOString();
  else delete data.fechaFin;

  await crearContrato(data);
  showCreateModal.value = false;
  form.value = { codigo: '', nombre: '', descripcion: '', fechaInicio: new Date().toISOString().split('T')[0], fechaFin: '' };
};
</script>
