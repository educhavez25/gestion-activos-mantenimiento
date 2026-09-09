import { apiClient } from './axiosClient';
import { ApiResponse, PaginatedResponse } from '../types/api';
import { MaintenanceFormData, MaintenanceRecord, MaintenanceFilters } from '../types/maintenance';

export const maintenancesApi = {
  getMaintenances: async (filters: MaintenanceFilters = {}): Promise<PaginatedResponse<MaintenanceRecord>> => {
    const { data } = await apiClient.get<PaginatedResponse<MaintenanceRecord>>('/maintenances', {
      params: filters,
    });
    return data;
  },

  getMaintenance: async (id: number | string): Promise<MaintenanceRecord> => {
    const { data } = await apiClient.get<ApiResponse<MaintenanceRecord>>(`/maintenances/${id}`);
    return data.data;
  },

  createMaintenance: async (payload: MaintenanceFormData): Promise<MaintenanceRecord> => {
    const { data } = await apiClient.post<ApiResponse<MaintenanceRecord>>('/maintenances', payload);
    return data.data;
  },

  updateMaintenance: async (id: number | string, payload: Partial<MaintenanceFormData>): Promise<MaintenanceRecord> => {
    const { data } = await apiClient.put<ApiResponse<MaintenanceRecord>>(`/maintenances/${id}`, payload);
    return data.data;
  },

  deleteMaintenance: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/maintenances/${id}`);
  },
};
