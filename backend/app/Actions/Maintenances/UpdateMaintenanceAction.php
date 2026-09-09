<?php

namespace App\Actions\Maintenances;

use App\Enums\AssetStatus;
use App\Enums\MaintenanceStatus;
use App\Models\MaintenanceRecord;
use Illuminate\Support\Facades\DB;

class UpdateMaintenanceAction
{
    /**
     * Execute maintenance update and synchronize asset status transitions.
     *
     * @param  array<string, mixed>  $data
     */
    public function execute(MaintenanceRecord $maintenance, array $data): MaintenanceRecord
    {
        return DB::transaction(function () use ($maintenance, $data) {
            $newStatus = is_string($data['status'])
                ? MaintenanceStatus::from($data['status'])
                : $data['status'];

            $asset = $maintenance->asset;

            if ($newStatus === MaintenanceStatus::InProgress) {
                $asset->update(['status' => AssetStatus::InMaintenance]);
            } elseif (in_array($newStatus, [MaintenanceStatus::Completed, MaintenanceStatus::Cancelled])) {
                // Si se completa y no pasaron completed_date, registrar fecha actual
                if ($newStatus === MaintenanceStatus::Completed && empty($data['completed_date'])) {
                    $data['completed_date'] = now()->toDateString();
                }

                // Restaurar estado del activo a Asignado (si tiene responsable) o Disponible
                $newAssetStatus = $asset->assigned_to ? AssetStatus::Assigned : AssetStatus::Available;
                $asset->update(['status' => $newAssetStatus]);
            }

            $maintenance->update($data);

            return $maintenance->load(['asset', 'performedBy']);
        });
    }
}
