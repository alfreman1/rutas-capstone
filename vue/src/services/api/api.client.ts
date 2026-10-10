import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {}
export const apiClient: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response.data; // Desempaquetamos la capa axios (axios.data.data -> api.data)
  },
  async (error: AxiosError<any>) => {
    // Notify via event bus / window
    const apiError = error.response?.data?.error;
    const title = apiError?.code || `Error ${error.response?.status || 500}`;
    const message = apiError?.message || error.message || 'Error interno del servidor';

    window.dispatchEvent(
      new CustomEvent('api-error', { 
        detail: { title, message } 
      })
    );

    if (error.response?.status === 401) {
      console.error('Unauthorized. Redirecting to login.');
      localStorage.removeItem('token');
      
      // Dynamic import of router to avoid circular dependencies
      const { default: router } = await import('../../app/router');
      const currentPath = router.currentRoute.value.fullPath;
      
      if (!currentPath.includes('/auth/login')) {
        router.push({
          path: '/auth/login',
          query: { redirect: currentPath }
        });
      }
    }
    return Promise.reject(error);
  }
);
