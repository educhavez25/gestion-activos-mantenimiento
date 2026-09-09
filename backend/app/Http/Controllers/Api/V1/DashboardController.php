<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\DashboardStatsService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function stats(DashboardStatsService $service): JsonResponse
    {
        return response()->json([
            'data' => $service->getStats(),
        ]);
    }
}
