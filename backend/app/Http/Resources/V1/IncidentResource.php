<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IncidentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'asset_id' => $this->asset_id,
            'asset' => new AssetResource($this->whenLoaded('asset')),
            'reported_by' => $this->reported_by,
            'reporter' => new UserResource($this->whenLoaded('reporter')),
            'assigned_to' => $this->assigned_to,
            'assignee' => new UserResource($this->whenLoaded('assignee')),
            'severity' => $this->severity,
            'status' => $this->status,
            'description' => $this->description,
            'resolution_notes' => $this->resolution_notes,
            'resolved_at' => $this->resolved_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
