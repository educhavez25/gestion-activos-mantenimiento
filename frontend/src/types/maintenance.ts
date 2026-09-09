import { Asset } from './asset';
import { User } from './auth';

export type MaintenanceType = 'preventive' | 'corrective';
export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface MaintenanceRecord {
  id: number;
  asset_id: number;
  asset?: Asset | null;
  type: MaintenanceType;
  status: MaintenanceStatus;
  scheduled_date: string;
  completed_date?: string | null;
  performed_by?: number | null;
  technician?: User | null;
  description: string;
  cost?: string | number | null;
  created_at?: string;
  updated_at?: string;
}

export interface MaintenanceFormData {
  asset_id: number | string;
  type: MaintenanceType;
  status?: MaintenanceStatus;
  scheduled_date: string;
  completed_date?: string | null;
  performed_by?: number | string | null;
  description: string;
  cost?: number | string | null;
}

export interface MaintenanceFilters {
  status?: string;
  type?: string;
  asset_id?: string;
  performed_by?: string;
  scheduled_from?: string;
  scheduled_to?: string;
  sort?: string;
  page?: number;
  per_page?: number;
}
