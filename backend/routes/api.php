<?php

use App\Http\Controllers\Api\V1\AssetController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\IncidentController;
use App\Http\Controllers\Api\V1\LocationController;
use App\Http\Controllers\Api\V1\MaintenanceRecordController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Rutas públicas de autenticación protegidas contra ataques de fuerza bruta
    Route::prefix('auth')->middleware('throttle:auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
    });

    // Rutas protegidas por Sanctum con limitador de tasa general
    Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
        // Sesión y perfil de usuario
        Route::prefix('auth')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me', [AuthController::class, 'me']);
        });

        // Dashboard & KPIs
        Route::get('dashboard/stats', [DashboardController::class, 'stats']);

        // Módulo de Activos
        Route::apiResource('assets', AssetController::class);

        // Módulo de Incidencias
        Route::patch('incidents/{incident}/status', [IncidentController::class, 'updateStatus']);
        Route::apiResource('incidents', IncidentController::class)->except(['update']);

        // Módulo de Mantenimientos
        Route::apiResource('maintenances', MaintenanceRecordController::class);

        // Catálogos y Usuarios
        Route::apiResource('categories', CategoryController::class)->only(['index', 'store', 'destroy']);
        Route::apiResource('locations', LocationController::class)->only(['index', 'store', 'destroy']);
        Route::get('users', [UserController::class, 'index']);
        Route::get('roles', [UserController::class, 'roles']);
    });
});
