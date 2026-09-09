import { Category, Location } from './catalog';
import { User } from './auth';

export type AssetStatus = 'available' | 'assigned' | 'in_maintenance' | 'retired';

export interface Asset {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  status: AssetStatus;
  purchase_date?: string | null;
  warranty_expiration?: string | null;
  category?: Category | null;
  location?: Location | null;
  assignee?: User | null;
  created_at?: string;
  updated_at?: string;
}

export interface AssetFormData {
  code: string;
  name: string;
  description?: string;
  category_id: number | string;
  location_id: number | string;
  assigned_to?: number | string | null;
  status?: AssetStatus;
  purchase_date?: string;
  warranty_expiration?: string;
}

export interface AssetFilters {
  search?: string;
  status?: string;
  category_id?: string;
  location_id?: string;
  assigned_to?: string;
  sort?: string;
  page?: number;
  per_page?: number;
}
