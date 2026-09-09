import { apiClient } from './axiosClient';
import { ApiResponse, PaginatedResponse } from '../types/api';
import { Incident, IncidentFilters, IncidentFormData, IncidentStatus } from '../types/incident';

export const incidentsApi = {
  getIncidents: async (filters: IncidentFilters = {}): Promise<PaginatedResponse<Incident>> => {
    const { data } = await apiClient.get<PaginatedResponse<Incident>>('/incidents', {
      params: filters,
    });
    return data;
  },

  getIncident: async (id: number | string): Promise<Incident> => {
    const { data } = await apiClient.get<ApiResponse<Incident>>(`/incidents/${id}`);
    return data.data;
  },

  createIncident: async (payload: IncidentFormData): Promise<Incident> => {
    const { data } = await apiClient.post<ApiResponse<Incident>>('/incidents', payload);
    return data.data;
  },

  updateStatus: async (
    id: number | string,
    payload: { status: IncidentStatus; resolution_notes?: string }
  ): Promise<Incident> => {
    const { data } = await apiClient.patch<ApiResponse<Incident>>(`/incidents/${id}/status`, payload);
    return data.data;
  },

  deleteIncident: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/incidents/${id}`);
  },
};
