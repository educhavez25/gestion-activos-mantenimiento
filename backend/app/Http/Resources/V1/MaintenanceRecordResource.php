<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MaintenanceRecordResource extends JsonResource
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
            'type' => $this->type,
            'status' => $this->status,
            'scheduled_date' => $this->scheduled_date?->format('Y-m-d'),
            'completed_date' => $this->completed_date?->format('Y-m-d'),
            'performed_by' => $this->performed_by,
            'technician' => new UserResource($this->whenLoaded('performedBy')),
            'description' => $this->description,
            'cost' => $this->cost,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
