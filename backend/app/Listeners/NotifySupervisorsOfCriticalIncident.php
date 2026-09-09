<?php

namespace App\Listeners;

use App\Events\CriticalIncidentReported;
use Illuminate\Support\Facades\Log;

class NotifySupervisorsOfCriticalIncident
{
    /**
     * Handle the critical incident event.
     */
    public function handle(CriticalIncidentReported $event): void
    {
        $incident = $event->incident;

        Log::warning('ALERTA CRÍTICA: Se ha reportado una incidencia de severidad crítica.', [
            'incident_id' => $incident->id,
            'asset_id' => $incident->asset_id,
            'asset_code' => $incident->asset?->code,
            'reported_by' => $incident->reported_by,
            'description' => $incident->description,
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
