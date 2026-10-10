<template>
  <div class="bg-white p-8 rounded-xl shadow-lg border border-slate-100">
    <div class="text-center mb-8">
      <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
        <i class="pi pi-map-marker text-white text-3xl"></i>
      </div>
      <h1 class="text-2xl font-bold text-slate-800">LogiRoute</h1>
      <p class="text-slate-500 mt-2 text-sm">Ingresa tus credenciales para continuar</p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-6">
      <div>
        <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Usuario / Email</label>
        <span class="p-input-icon-left w-full">
          <i class="pi pi-user" />
          <InputText id="email" v-model="email" type="email" class="w-full" placeholder="admin@logistica.local" :class="{ 'p-invalid': error }" />
        </span>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
        <span class="p-input-icon-left w-full">
          <i class="pi pi-lock" />
          <InputText id="password" v-model="password" type="password" class="w-full" placeholder="••••••••" :class="{ 'p-invalid': error }" />
        </span>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <Checkbox v-model="rememberMe" inputId="rememberMe" binary />
          <label for="rememberMe" class="ml-2 text-sm text-slate-600">Recordarme</label>
        </div>
        <a href="#" class="text-sm text-blue-600 hover:text-blue-800 hover:underline">¿Olvidaste tu contraseña?</a>
      </div>

      <div v-if="error" class="p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100 flex items-center">
        <i class="pi pi-exclamation-circle mr-2"></i> {{ error }}
      </div>

      <Button type="submit" label="Ingresar" class="w-full" :loading="isLoading" />
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import { authService } from '../services/auth.service';

const router = useRouter();
const route = useRoute();
const email = ref('admin@logistica.local');
const password = ref('admin1234');
const rememberMe = ref(false);
const isLoading = ref(false);
const error = ref('');

const handleLogin = async () => {
  try {
    isLoading.value = true;
    error.value = '';
    const res: any = await authService.login(email.value, password.value);
    
    if (res.success && res.data?.accessToken) {
      localStorage.setItem('token', res.data.accessToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      const redirect = route.query.redirect as string;
      router.push(redirect || '/dashboard');
    } else {
      throw new Error('Respuesta inválida');
    }
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message || 'Credenciales inválidas';
  } finally {
    isLoading.value = false;
  }
};
</script>
