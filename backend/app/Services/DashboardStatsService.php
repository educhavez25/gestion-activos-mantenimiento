<?php

namespace App\Services;

use App\Enums\AssetStatus;
use App\Enums\IncidentSeverity;
use App\Enums\IncidentStatus;
use App\Enums\MaintenanceStatus;
use App\Http\Resources\V1\IncidentResource;
use App\Http\Resources\V1\MaintenanceRecordResource;
use App\Models\Asset;
use App\Models\Incident;
use App\Models\MaintenanceRecord;

class DashboardStatsService
{
    /**
     * Compute aggregated system KPIs and metrics.
     *
     * @return array<string, mixed>
     */
    public function getStats(): array
    {
        $assetsSummary = [
            'total' => Asset::count(),
            'available' => Asset::where('status', AssetStatus::Available)->count(),
            'assigned' => Asset::where('status', AssetStatus::Assigned)->count(),
            'in_maintenance' => Asset::where('status', AssetStatus::InMaintenance)->count(),
            'retired' => Asset::where('status', AssetStatus::Retired)->count(),
        ];

        $incidentsSummary = [
            'total' => Incident::count(),
            'open' => Incident::where('status', IncidentStatus::Open)->count(),
            'in_progress' => Incident::where('status', IncidentStatus::InProgress)->count(),
            'resolved' => Incident::where('status', IncidentStatus::Resolved)->count(),
            'closed' => Incident::where('status', IncidentStatus::Closed)->count(),
            'critical' => Incident::where('severity', IncidentSeverity::Critical)
                ->whereIn('status', [IncidentStatus::Open, IncidentStatus::InProgress, IncidentStatus::Assigned])
                ->count(),
        ];

        $currentMonthStart = now()->startOfMonth()->toDateString();
        $currentMonthEnd = now()->endOfMonth()->toDateString();

        $maintenancesSummary = [
            'total' => MaintenanceRecord::count(),
            'scheduled' => MaintenanceRecord::where('status', MaintenanceStatus::Scheduled)->count(),
            'in_progress' => MaintenanceRecord::where('status', MaintenanceStatus::InProgress)->count(),
            'completed' => MaintenanceRecord::where('status', MaintenanceStatus::Completed)->count(),
            'monthly_cost' => (float) MaintenanceRecord::where('status', MaintenanceStatus::Completed)
                ->whereBetween('completed_date', [$currentMonthStart, $currentMonthEnd])
                ->sum('cost'),
            'total_cost' => (float) MaintenanceRecord::where('status', MaintenanceStatus::Completed)->sum('cost'),
        ];

        $recentIncidents = Incident::with(['asset', 'reporter'])
            ->latest()
            ->limit(5)
            ->get();

        $upcomingMaintenances = MaintenanceRecord::with(['asset', 'performedBy'])
            ->whereIn('status', [MaintenanceStatus::Scheduled, MaintenanceStatus::InProgress])
            ->orderBy('scheduled_date', 'asc')
            ->limit(5)
            ->get();

        return [
            'assets' => $assetsSummary,
            'incidents' => $incidentsSummary,
            'maintenances' => $maintenancesSummary,
            'recent_incidents' => IncidentResource::collection($recentIncidents),
            'upcoming_maintenances' => MaintenanceRecordResource::collection($upcomingMaintenances),
        ];
    }
}
