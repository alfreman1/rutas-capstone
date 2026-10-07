import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

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
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Logic to handle refresh token or logout
      console.error('Unauthorized. Need to implement refresh token logic.');
      // localStorage.removeItem('token');
      // window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);
