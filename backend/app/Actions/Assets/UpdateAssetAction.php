<?php

namespace App\Actions\Assets;

use App\Enums\AssetStatus;
use App\Models\Asset;
use Illuminate\Support\Facades\DB;

class UpdateAssetAction
{
    /**
     * Execute the asset update logic with business rules.
     *
     * @param  array<string, mixed>  $data
     */
    public function execute(Asset $asset, array $data): Asset
    {
        return DB::transaction(function () use ($asset, $data) {
            // Regla de negocio: Si el activo se da de baja, no puede tener usuario asignado
            if (isset($data['status']) && $data['status'] === AssetStatus::Retired->value) {
                $data['assigned_to'] = null;
            }

            // Regla de negocio: Si se desasigna y su estado era 'assigned', vuelve a 'available'
            if (array_key_exists('assigned_to', $data) && empty($data['assigned_to'])) {
                if (($data['status'] ?? $asset->status->value) === AssetStatus::Assigned->value) {
                    $data['status'] = AssetStatus::Available;
                }
            }

            $asset->update($data);

            return $asset->load(['category', 'location', 'assignee']);
        });
    }
}
