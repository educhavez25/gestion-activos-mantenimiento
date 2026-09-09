import { apiClient } from './axiosClient';
import { ApiResponse } from '../types/api';
import { DashboardStats } from '../types/dashboard';

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return data.data;
  },
};
