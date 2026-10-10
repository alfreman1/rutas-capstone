<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Catálogo de Vehículos</h1>
        <p class="text-slate-500 text-sm mt-1">Gestión de la flota de transporte</p>
      </div>
      <Button 
        label="Nuevo Vehículo" 
        icon="pi pi-plus" 
        class="p-button-primary mt-4 md:mt-0" 
        @click="showCreateModal = true"
      />
    </div>

    <!-- Filtros -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center">
      <div class="p-input-icon-left flex-1 min-w-[250px]">
        <i class="pi pi-search" />
        <InputText v-model="search" placeholder="Buscar por placa o código..." class="w-full" @keyup.enter="aplicarFiltros" />
      </div>
      <Dropdown v-model="tipoFilter" :options="tipos" placeholder="Tipo" class="w-48" @change="aplicarFiltros" />
      <Dropdown v-model="estadoFilter" :options="estados" placeholder="Estado" class="w-48" @change="aplicarFiltros" />
      <Button icon="pi pi-times" severity="secondary" text @click="limpiarFiltros" v-tooltip="'Limpiar filtros'" />
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <DataTable 
        :value="vehiculos" 
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
          <div class="p-8 text-center text-slate-500">
            No se encontraron vehículos.
          </div>
        </template>
        
        <Column field="codigo" header="Código" class="font-semibold"></Column>
        <Column field="placa" header="Placa">
          <template #body="{ data }">
            <span class="bg-slate-100 text-slate-800 px-2 py-1 rounded font-mono border border-slate-300">
              {{ data.placa }}
            </span>
          </template>
        </Column>
        <Column field="tipo" header="Tipo">
          <template #body="{ data }">
            <Tag :value="data.tipo" severity="info" rounded></Tag>
          </template>
        </Column>
        <Column header="Capacidad (Kg / M3)">
          <template #body="{ data }">
            {{ data.capacidadPesoKg }} kg / {{ data.capacidadVolumenM3 }} m³
          </template>
        </Column>
        <Column field="estado" header="Estado">
          <template #body="{ data }">
            <Tag :value="data.estado" :severity="getSeverity(data.estado)"></Tag>
          </template>
        </Column>
        <Column header="Acciones">
          <template #body>
            <Button icon="pi pi-pencil" text rounded severity="secondary"></Button>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Modal Crear -->
    <Dialog v-model:visible="showCreateModal" modal header="Registrar Vehículo" :style="{ width: '500px' }">
      <div class="space-y-4 pt-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Código</label>
            <InputText v-model="form.codigo" class="w-full" placeholder="Ej. V-001" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Placa</label>
            <InputText v-model="form.placa" class="w-full" placeholder="Ej. ABC-123" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Tipo de Vehículo</label>
          <Dropdown v-model="form.tipo" :options="tipos" class="w-full" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Capacidad (Kg)</label>
            <InputNumber v-model="form.capacidadPesoKg" :min="0" :maxFractionDigits="2" class="w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Volumen (m³)</label>
            <InputNumber v-model="form.capacidadVolumenM3" :min="0" :maxFractionDigits="2" class="w-full" />
          </div>
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="showCreateModal = false" />
        <Button label="Guardar" icon="pi pi-check" @click="guardar" :loading="isCreando" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useVehiculos } from '../composables/useVehiculos';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';

const { vehiculos, totalRecords, isFetching, queryParams, crearVehiculo, isCreando } = useVehiculos();

const search = ref('');
const tipoFilter = ref<string | null>(null);
const estadoFilter = ref<string | null>(null);

const tipos = ['FURGON', 'CAMION', 'MOTO', 'CAMIONETA'];
const estados = ['ACTIVO', 'INACTIVO', 'MANTENIMIENTO'];

const showCreateModal = ref(false);
const form = ref({
  codigo: '',
  placa: '',
  tipo: 'FURGON',
  capacidadPesoKg: 0,
  capacidadVolumenM3: 0,
});

const aplicarFiltros = () => {
  queryParams.value.search = search.value;
  queryParams.value.tipo = tipoFilter.value || undefined;
  queryParams.value.estado = estadoFilter.value || undefined;
  queryParams.value.page = 1;
};

const limpiarFiltros = () => {
  search.value = '';
  tipoFilter.value = null;
  estadoFilter.value = null;
  aplicarFiltros();
};

const onPage = (event: any) => {
  queryParams.value.page = event.page + 1;
};

const getSeverity = (status: string) => {
  switch (status) {
    case 'ACTIVO': return 'success';
    case 'INACTIVO': return 'danger';
    case 'MANTENIMIENTO': return 'warning';
    default: return 'secondary';
  }
};

const guardar = async () => {
  await crearVehiculo({
    ...form.value,
    tipo: form.value.tipo as any,
  });
  showCreateModal.value = false;
  form.value = { codigo: '', placa: '', tipo: 'FURGON', capacidadPesoKg: 0, capacidadVolumenM3: 0 };
};
</script>
