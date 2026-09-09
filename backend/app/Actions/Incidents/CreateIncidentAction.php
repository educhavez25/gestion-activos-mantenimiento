<?php

namespace App\Actions\Incidents;

use App\Enums\AssetStatus;
use App\Enums\IncidentSeverity;
use App\Enums\IncidentStatus;
use App\Events\CriticalIncidentReported;
use App\Models\Asset;
use App\Models\Incident;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateIncidentAction
{
    /**
     * Execute incident creation and apply domain side effects.
     *
     * @param  array<string, mixed>  $data
     */
    public function execute(User $reporter, array $data): Incident
    {
        $incident = DB::transaction(function () use ($reporter, $data) {
            $data['reported_by'] = $reporter->id;

            // Si se asigna de entrada a un técnico, su estado es 'assigned', sino 'open'
            if (! empty($data['assigned_to'])) {
                $data['status'] = IncidentStatus::Assigned;
            } else {
                $data['status'] = IncidentStatus::Open;
            }

            $incident = Incident::create($data);

            // Regla de Negocio: Si la incidencia es crítica, el activo pasa automáticamente a 'in_maintenance'
            $severity = is_string($data['severity'])
                ? IncidentSeverity::from($data['severity'])
                : $data['severity'];

            if ($severity === IncidentSeverity::Critical) {
                $asset = Asset::findOrFail($data['asset_id']);
                $asset->update(['status' => AssetStatus::InMaintenance]);
            }

            return $incident->load(['asset', 'reporter', 'assignee']);
        });

        // Disparar evento de dominio tras confirmar la transacción
        if ($incident->severity === IncidentSeverity::Critical) {
            CriticalIncidentReported::dispatch($incident);
        }

        return $incident;
    }
}
