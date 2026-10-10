import { apiClient } from '@/services/api/api.client';

export const authService = {
  async login(email: string, password: string):Promise<{ accessToken: string, user: any }> {
    return apiClient.post('/auth/login', { email, password });
  }
};
