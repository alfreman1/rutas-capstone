<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Planificaciones</h1>
        <p class="text-slate-500 text-sm mt-1">Gestión de jornadas y enrutamiento</p>
      </div>
      <Button 
        label="Nueva Planificación" 
        icon="pi pi-plus" 
        class="p-button-primary mt-4 md:mt-0" 
        @click="showCreateModal = true"
      />
    </div>

    <!-- Filtros -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center">
      <div class="p-input-icon-left flex-1 min-w-[250px]">
        <i class="pi pi-search" />
        <InputText v-model="queryParams.search" placeholder="Buscar por fecha o ID..." class="w-full" />
      </div>
      <Dropdown v-model="queryParams.estado" :options="estados" placeholder="Estado" class="w-48" />
      <Button icon="pi pi-times" severity="secondary" text @click="queryParams.search=''; queryParams.estado=undefined" v-tooltip="'Limpiar filtros'" />
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <DataTable 
        :value="planificaciones" 
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
          <div class="p-8 text-center text-slate-500">No se encontraron planificaciones.</div>
        </template>
        
        <Column field="id" header="ID"></Column>
        <Column field="fecha" header="Fecha de Jornada">
          <template #body="{ data }">
            <span class="font-medium text-slate-700">
              <i class="pi pi-calendar mr-2 text-slate-400"></i>{{ data.fecha }}
            </span>
          </template>
        </Column>
        <Column field="puntos" header="Entregas">
          <template #body="{ data }">
            <span class="text-sm">{{ data.puntos }} Puntos</span>
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
              <Button 
                v-if="data.estado === 'GENERADA' || data.estado === 'COMPLETADA'"
                icon="pi pi-eye" 
                label="Ver Detalle" 
                size="small" 
                severity="success" 
                text 
                @click="$router.push(`/planificaciones/${data.id}`)"
              />
              <Button 
                v-else-if="data.estado === 'PROCESANDO' || data.estado === 'GENERANDO'"
                icon="pi pi-search" 
                label="Ver Estado" 
                size="small" 
                severity="warning" 
                text 
                @click="abrirModalEstado(data.id)"
              />
              <Button 
                v-else
                icon="pi pi-sparkles" 
                label="Optimizar" 
                size="small" 
                severity="info" 
                text 
                @click="$router.push(`/planificaciones/${data.id}`)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Modal Crear -->
    <Dialog v-model:visible="showCreateModal" modal header="Generar Planificación" :style="{ width: '400px' }">
      <div class="space-y-4 pt-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Fecha de Operación</label>
          <InputText type="date" v-model="form.fecha" class="w-full" />
        </div>
        <p class="text-sm text-slate-500">Esto importará todas las demandas del día seleccionado para organizar la ruta.</p>
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="showCreateModal = false" />
        <Button label="Crear" icon="pi pi-check" @click="guardar" />
      </template>
    </Dialog>

    <!-- Modal Estado de IA -->
    <Dialog v-model:visible="showEstadoModal" modal header="Estado del Motor IA" :style="{ width: '400px' }">
      <div class="space-y-4 pt-4 text-center">
        <div v-if="isCheckingState" class="py-4">
          <i class="pi pi-spin pi-spinner text-4xl text-indigo-500 mb-4"></i>
          <p class="text-slate-600">Consultando estado en tiempo real...</p>
        </div>
        <div v-else-if="estadoActualJob">
          <div class="mb-4">
            <Tag :value="estadoActualJob.estado" :severity="getSeverity(estadoActualJob.estado)" class="text-lg px-4 py-2" />
          </div>
          
          <div v-if="estadoActualJob.estado === 'ERROR' && estadoActualJob.error" class="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4 border border-red-200">
            <strong>Motivo del fallo:</strong> <br/>
            {{ estadoActualJob.error }}
          </div>
          
          <p class="text-slate-600 mb-2"><strong>ID:</strong> {{ currentCheckingId }}</p>
          <p class="text-sm text-slate-500" v-if="estadoActualJob.estado !== 'ERROR'">
            Si el estado es COMPLETADA, puedes ir al detalle para visualizar las rutas.
          </p>
        </div>
        <div v-else class="py-4 text-red-500">
          <i class="pi pi-exclamation-triangle text-4xl mb-4"></i>
          <p>No se pudo recuperar el estado actual.</p>
        </div>
      </div>
      <template #footer>
        <Button label="Cerrar" icon="pi pi-times" text @click="showEstadoModal = false" />
        <Button label="Ir al Detalle" icon="pi pi-arrow-right" severity="info" v-if="estadoActualJob?.estado === 'COMPLETADA' || estadoActualJob?.estado === 'GENERADA'" @click="$router.push(`/planificaciones/${currentCheckingId}`)" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import { usePlanificaciones } from '../composables/usePlanificaciones';
import { planificacionService } from '../services/planificacion.service';

const router = useRouter();
const estados = ['BORRADOR', 'PROCESANDO', 'GENERADA', 'ERROR', 'GENERANDO'];

const showCreateModal = ref(false);
const form = ref({ fecha: new Date().toISOString().split('T')[0] });

// Estado de Modal de IA
const showEstadoModal = ref(false);
const isCheckingState = ref(false);
const estadoActualJob = ref<any>(null);
const currentCheckingId = ref('');

const { planificaciones, totalRecords, isFetching, queryParams } = usePlanificaciones();

const onPage = (event: any) => {
  queryParams.value.page = event.page + 1;
  queryParams.value.limit = event.rows;
};

const getSeverity = (status: string) => {
  switch (status) {
    case 'GENERADA':
    case 'COMPLETADA': return 'success';
    case 'GENERANDO':
    case 'PROCESANDO': return 'warn';
    case 'BORRADOR': return 'secondary';
    case 'ERROR': return 'danger';
    default: return 'secondary';
  }
};

const abrirModalEstado = async (id: string) => {
  currentCheckingId.value = id;
  estadoActualJob.value = null;
  showEstadoModal.value = true;
  isCheckingState.value = true;
  
  try {
    const data = await planificacionService.consultarEstado(id);
    estadoActualJob.value = data;
  } catch (error) {
    console.error(error);
  } finally {
    isCheckingState.value = false;
  }
};

const guardar = () => {
  const newId = `PLN-2026-999`; // Mock id para navegacion
  showCreateModal.value = false;
  router.push(`/planificaciones/${newId}`);
};
</script>
