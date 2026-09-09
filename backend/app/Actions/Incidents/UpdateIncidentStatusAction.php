<?php

namespace App\Actions\Incidents;

use App\Enums\IncidentStatus;
use App\Models\Incident;
use Illuminate\Support\Facades\DB;

class UpdateIncidentStatusAction
{
    /**
     * Execute status transition and timestamp resolution.
     *
     * @param  array<string, mixed>  $data
     */
    public function execute(Incident $incident, array $data): Incident
    {
        return DB::transaction(function () use ($incident, $data) {
            $newStatus = is_string($data['status'])
                ? IncidentStatus::from($data['status'])
                : $data['status'];

            $updatePayload = [
                'status' => $newStatus,
            ];

            if (isset($data['resolution_notes'])) {
                $updatePayload['resolution_notes'] = $data['resolution_notes'];
            }

            if ($newStatus === IncidentStatus::Resolved && is_null($incident->resolved_at)) {
                $updatePayload['resolved_at'] = now();
            }

            $incident->update($updatePayload);

            return $incident->load(['asset', 'reporter', 'assignee']);
        });
    }
}
