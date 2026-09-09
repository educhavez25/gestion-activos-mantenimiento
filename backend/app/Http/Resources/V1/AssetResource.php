<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetResource extends JsonResource
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
            'code' => $this->code,
            'name' => $this->name,
            'description' => $this->description,
            'status' => $this->status,
            'purchase_date' => $this->purchase_date?->format('Y-m-d'),
            'warranty_expiration' => $this->warranty_expiration?->format('Y-m-d'),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'location' => new LocationResource($this->whenLoaded('location')),
            'assignee' => new UserResource($this->whenLoaded('assignee')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
