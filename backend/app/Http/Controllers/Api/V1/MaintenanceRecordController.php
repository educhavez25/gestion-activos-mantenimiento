<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Maintenances\CreateMaintenanceAction;
use App\Actions\Maintenances\UpdateMaintenanceAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Maintenances\StoreMaintenanceRequest;
use App\Http\Requests\V1\Maintenances\UpdateMaintenanceRequest;
use App\Http\Resources\V1\MaintenanceRecordResource;
use App\Models\MaintenanceRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class MaintenanceRecordController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', MaintenanceRecord::class);

        $perPage = min((int) $request->query('per_page', 15), 100);

        $maintenances = MaintenanceRecord::with(['asset', 'performedBy'])
            ->filter($request->query())
            ->paginate($perPage);

        return MaintenanceRecordResource::collection($maintenances);
    }

    public function show(MaintenanceRecord $maintenance): MaintenanceRecordResource
    {
        Gate::authorize('view', $maintenance);

        $maintenance->load(['asset', 'performedBy']);

        return new MaintenanceRecordResource($maintenance);
    }

    public function store(StoreMaintenanceRequest $request, CreateMaintenanceAction $action): JsonResponse
    {
        Gate::authorize('create', MaintenanceRecord::class);

        $maintenance = $action->execute($request->validated());

        return (new MaintenanceRecordResource($maintenance))
            ->response()
            ->setStatusCode(201);
    }

    public function update(
        UpdateMaintenanceRequest $request,
        MaintenanceRecord $maintenance,
        UpdateMaintenanceAction $action
    ): MaintenanceRecordResource {
        Gate::authorize('update', $maintenance);

        $updatedMaintenance = $action->execute($maintenance, $request->validated());

        return new MaintenanceRecordResource($updatedMaintenance);
    }

    public function destroy(MaintenanceRecord $maintenance): JsonResponse
    {
        Gate::authorize('delete', $maintenance);

        $maintenance->delete();

        return response()->json(['message' => 'Registro de mantenimiento eliminado correctamente.']);
    }
}
