<template>
  <Toast />
  <router-view />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';

const toast = useToast();

const handleApiError = (event: any) => {
  const detail = event.detail;
  toast.add({
    severity: 'error',
    summary: detail?.title || 'Error',
    detail: detail?.message || 'Ha ocurrido un error inesperado',
    life: 5000
  });
};

onMounted(() => {
  window.addEventListener('api-error', handleApiError);
});

onUnmounted(() => {
  window.removeEventListener('api-error', handleApiError);
});
</script>
