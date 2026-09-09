import { apiClient } from './axiosClient';
import { ApiResponse } from '../types/api';
import { AuthResponseData, LoginCredentials, RegisterData, User } from '../types/auth';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponseData> => {
    const { data } = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', credentials);
    return data.data;
  },

  register: async (payload: RegisterData): Promise<AuthResponseData> => {
    const { data } = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/register', payload);
    return data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<ApiResponse<User>>('/auth/me');
    return data.data;
  },
};
