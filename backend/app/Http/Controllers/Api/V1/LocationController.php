<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Locations\StoreLocationRequest;
use App\Http\Resources\V1\LocationResource;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class LocationController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return LocationResource::collection(Location::with('parent')->orderBy('name')->get());
    }

    public function store(StoreLocationRequest $request): JsonResponse
    {
        $location = Location::create($request->validated());
        $location->load('parent');

        return (new LocationResource($location))
            ->response()
            ->setStatusCode(201);
    }

    public function destroy(Location $location): JsonResponse
    {
        $location->delete();

        return response()->json(['message' => 'Ubicación eliminada correctamente.']);
    }
}
