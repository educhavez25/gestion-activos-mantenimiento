<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Incidents\CreateIncidentAction;
use App\Actions\Incidents\UpdateIncidentStatusAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Incidents\StoreIncidentRequest;
use App\Http\Requests\V1\Incidents\UpdateIncidentStatusRequest;
use App\Http\Resources\V1\IncidentResource;
use App\Models\Incident;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class IncidentController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Incident::class);

        $perPage = min((int) $request->query('per_page', 15), 100);

        $query = Incident::with(['asset', 'reporter', 'assignee'])
            ->filter($request->query());

        // Si es usuario regular, solo ve las incidencias reportadas por él
        if (! $request->user()->hasRole('administrador') && ! $request->user()->hasRole('supervisor')) {
            if ($request->user()->hasRole('tecnico')) {
                $query->where(function ($q) use ($request) {
                    $q->where('assigned_to', $request->user()->id)
                        ->orWhere('reported_by', $request->user()->id);
                });
            } else {
                $query->where('reported_by', $request->user()->id);
            }
        }

        $incidents = $query->paginate($perPage);

        return IncidentResource::collection($incidents);
    }

    public function show(Incident $incident): IncidentResource
    {
        Gate::authorize('view', $incident);

        $incident->load(['asset', 'reporter', 'assignee']);

        return new IncidentResource($incident);
    }

    public function store(StoreIncidentRequest $request, CreateIncidentAction $action): JsonResponse
    {
        Gate::authorize('create', Incident::class);

        $incident = $action->execute($request->user(), $request->validated());

        return (new IncidentResource($incident))
            ->response()
            ->setStatusCode(201);
    }

    public function updateStatus(
        UpdateIncidentStatusRequest $request,
        Incident $incident,
        UpdateIncidentStatusAction $action
    ): IncidentResource {
        Gate::authorize('updateStatus', $incident);

        $updatedIncident = $action->execute($incident, $request->validated());

        return new IncidentResource($updatedIncident);
    }

    public function destroy(Incident $incident): JsonResponse
    {
        Gate::authorize('delete', $incident);

        $incident->delete();

        return response()->json(['message' => 'Incidencia eliminada correctamente.']);
    }
}
