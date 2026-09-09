<?php

namespace App\Actions\Assets;

use App\Enums\AssetStatus;
use App\Models\Asset;
use Illuminate\Support\Facades\DB;

class CreateAssetAction
{
    /**
     * Execute the asset creation logic.
     *
     * @param  array<string, mixed>  $data
     */
    public function execute(array $data): Asset
    {
        return DB::transaction(function () use ($data) {
            // Regla de negocio: Si se asigna un responsable y no se indicó status, pasa a 'assigned'
            if (! empty($data['assigned_to']) && empty($data['status'])) {
                $data['status'] = AssetStatus::Assigned;
            } elseif (empty($data['status'])) {
                $data['status'] = AssetStatus::Available;
            }

            $asset = Asset::create($data);

            return $asset->load(['category', 'location', 'assignee']);
        });
    }
}
