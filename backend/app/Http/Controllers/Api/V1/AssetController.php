<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Assets\CreateAssetAction;
use App\Actions\Assets\UpdateAssetAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Assets\StoreAssetRequest;
use App\Http\Requests\V1\Assets\UpdateAssetRequest;
use App\Http\Resources\V1\AssetResource;
use App\Models\Asset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class AssetController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Asset::class);

        $perPage = min((int) $request->query('per_page', 15), 100);

        $assets = Asset::with(['category', 'location', 'assignee'])
            ->filter($request->query())
            ->paginate($perPage);

        return AssetResource::collection($assets);
    }

    public function show(Asset $asset): AssetResource
    {
        Gate::authorize('view', $asset);

        $asset->load(['category', 'location', 'assignee']);

        return new AssetResource($asset);
    }

    public function store(StoreAssetRequest $request, CreateAssetAction $action): JsonResponse
    {
        Gate::authorize('create', Asset::class);

        $asset = $action->execute($request->validated());

        return (new AssetResource($asset))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateAssetRequest $request, Asset $asset, UpdateAssetAction $action): AssetResource
    {
        Gate::authorize('update', $asset);

        $updatedAsset = $action->execute($asset, $request->validated());

        return new AssetResource($updatedAsset);
    }

    public function destroy(Asset $asset): JsonResponse
    {
        Gate::authorize('delete', $asset);

        $asset->delete();

        return response()->json(['message' => 'Activo eliminado correctamente.']);
    }
}
