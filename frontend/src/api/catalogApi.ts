import { apiClient } from './axiosClient';
import { ApiResponse } from '../types/api';
import { Role, User } from '../types/auth';
import { Category, Location } from '../types/catalog';

export const catalogApi = {
  getCategories: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return data.data;
  },

  createCategory: async (payload: { name: string; description?: string }): Promise<Category> => {
    const { data } = await apiClient.post<ApiResponse<Category>>('/categories', payload);
    return data.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },

  getLocations: async (): Promise<Location[]> => {
    const { data } = await apiClient.get<ApiResponse<Location[]>>('/locations');
    return data.data;
  },

  createLocation: async (payload: { name: string; description?: string; parent_location_id?: number | null }): Promise<Location> => {
    const { data } = await apiClient.post<ApiResponse<Location>>('/locations', payload);
    return data.data;
  },

  deleteLocation: async (id: number): Promise<void> => {
    await apiClient.delete(`/locations/${id}`);
  },

  getUsers: async (role?: string): Promise<User[]> => {
    const { data } = await apiClient.get<ApiResponse<User[]>>('/users', {
      params: role ? { role } : {},
    });
    return data.data;
  },

  getRoles: async (): Promise<Role[]> => {
    const { data } = await apiClient.get<ApiResponse<Role[]>>('/roles');
    return data.data;
  },
};
