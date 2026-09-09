import { apiClient } from './axiosClient';
import { ApiResponse, PaginatedResponse } from '../types/api';
import { Asset, AssetFilters, AssetFormData } from '../types/asset';

export const assetsApi = {
  getAssets: async (filters: AssetFilters = {}): Promise<PaginatedResponse<Asset>> => {
    const { data } = await apiClient.get<PaginatedResponse<Asset>>('/assets', {
      params: filters,
    });
    return data;
  },

  getAsset: async (id: number | string): Promise<Asset> => {
    const { data } = await apiClient.get<ApiResponse<Asset>>(`/assets/${id}`);
    return data.data;
  },

  createAsset: async (payload: AssetFormData): Promise<Asset> => {
    const { data } = await apiClient.post<ApiResponse<Asset>>('/assets', payload);
    return data.data;
  },

  updateAsset: async (id: number | string, payload: AssetFormData): Promise<Asset> => {
    const { data } = await apiClient.put<ApiResponse<Asset>>(`/assets/${id}`, payload);
    return data.data;
  },

  deleteAsset: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/assets/${id}`);
  },
};
