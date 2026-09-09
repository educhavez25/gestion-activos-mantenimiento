import { Incident } from './incident';
import { MaintenanceRecord } from './maintenance';

export interface DashboardStats {
  assets: {
    total: number;
    available: number;
    assigned: number;
    in_maintenance: number;
    retired: number;
  };
  incidents: {
    total: number;
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
    critical: number;
  };
  maintenances: {
    total: number;
    scheduled: number;
    in_progress: number;
    completed: number;
    monthly_cost: number;
    total_cost: number;
  };
  recent_incidents: Incident[];
  upcoming_maintenances: MaintenanceRecord[];
}
