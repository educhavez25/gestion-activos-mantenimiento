<?php

namespace App\Actions\Maintenances;

use App\Enums\AssetStatus;
use App\Enums\MaintenanceStatus;
use App\Models\Asset;
use App\Models\MaintenanceRecord;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CreateMaintenanceAction
{
    /**
     * Execute maintenance creation and validate asset availability.
     *
     * @param  array<string, mixed>  $data
     */
    public function execute(array $data): MaintenanceRecord
    {
        return DB::transaction(function () use ($data) {
            $asset = Asset::findOrFail($data['asset_id']);

            // Regla de negocio: No se puede programar un mantenimiento si ya existe uno activo/en progreso
            $hasActiveMaintenance = MaintenanceRecord::where('asset_id', $asset->id)
                ->whereIn('status', [MaintenanceStatus::Scheduled->value, MaintenanceStatus::InProgress->value])
                ->exists();

            if ($hasActiveMaintenance) {
                throw ValidationException::withMessages([
                    'asset_id' => ['El activo ya tiene un mantenimiento activo o programado.'],
                ]);
            }

            if (empty($data['status'])) {
                $data['status'] = MaintenanceStatus::Scheduled;
            }

            $maintenance = MaintenanceRecord::create($data);

            // Si se crea directamente 'en progreso', actualizamos el activo a 'in_maintenance'
            $status = is_string($data['status'])
                ? MaintenanceStatus::from($data['status'])
                : $data['status'];

            if ($status === MaintenanceStatus::InProgress) {
                $asset->update(['status' => AssetStatus::InMaintenance]);
            }

            return $maintenance->load(['asset', 'performedBy']);
        });
    }
}
