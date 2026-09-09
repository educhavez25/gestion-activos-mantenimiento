import { Asset } from './asset';
import { User } from './auth';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';

export interface Incident {
  id: number;
  asset_id: number;
  asset?: Asset | null;
  reported_by: number;
  reporter?: User | null;
  assigned_to?: number | null;
  assignee?: User | null;
  severity: IncidentSeverity;
  status: IncidentStatus;
  description: string;
  resolution_notes?: string | null;
  resolved_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface IncidentFormData {
  asset_id: number | string;
  severity: IncidentSeverity;
  description: string;
  assigned_to?: number | string | null;
}

export interface IncidentFilters {
  status?: string;
  severity?: string;
  asset_id?: string;
  reported_by?: string;
  assigned_to?: string;
  search?: string;
  sort?: string;
  page?: number;
  per_page?: number;
}
