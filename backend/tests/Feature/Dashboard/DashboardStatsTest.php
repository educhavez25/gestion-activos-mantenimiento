<?php

namespace Tests\Feature\Dashboard;

use App\Enums\AssetStatus;
use App\Enums\IncidentSeverity;
use App\Enums\IncidentStatus;
use App\Enums\MaintenanceStatus;
use App\Enums\MaintenanceType;
use App\Models\Asset;
use App\Models\Category;
use App\Models\Incident;
use App\Models\Location;
use App\Models\MaintenanceRecord;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardStatsTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);

        $userRole = Role::where('slug', 'usuario')->firstOrFail();
        $this->user = User::factory()->create(['role_id' => $userRole->id]);
    }

    public function test_guest_cannot_access_dashboard_stats(): void
    {
        $response = $this->getJson('/api/v1/dashboard/stats');
        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_fetch_dashboard_stats(): void
    {
        $category = Category::create(['name' => 'Laptops', 'description' => 'Portátiles']);
        $location = Location::create(['name' => 'Oficina', 'description' => 'Principal']);

        // Crear activos con diferentes estados
        Asset::create([
            'code' => 'AST-01',
            'name' => 'Laptop 1',
            'category_id' => $category->id,
            'location_id' => $location->id,
            'status' => AssetStatus::Available,
        ]);

        Asset::create([
            'code' => 'AST-02',
            'name' => 'Laptop 2',
            'category_id' => $category->id,
            'location_id' => $location->id,
            'status' => AssetStatus::InMaintenance,
        ]);

        // Crear incidencia crítica abierta
        $asset = Asset::first();
        Incident::create([
            'asset_id' => $asset->id,
            'reported_by' => $this->user->id,
            'severity' => IncidentSeverity::Critical,
            'status' => IncidentStatus::Open,
            'description' => 'Servidor sin energía',
        ]);

        // Crear mantenimiento completado con costo
        MaintenanceRecord::create([
            'asset_id' => $asset->id,
            'type' => MaintenanceType::Preventive,
            'status' => MaintenanceStatus::Completed,
            'scheduled_date' => now()->toDateString(),
            'completed_date' => now()->toDateString(),
            'description' => 'Mantenimiento de rutina',
            'cost' => 250.50,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/dashboard/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'assets' => ['total', 'available', 'assigned', 'in_maintenance', 'retired'],
                    'incidents' => ['total', 'open', 'in_progress', 'resolved', 'closed', 'critical'],
                    'maintenances' => ['total', 'scheduled', 'in_progress', 'completed', 'monthly_cost', 'total_cost'],
                    'recent_incidents',
                    'upcoming_maintenances',
                ],
            ])
            ->assertJsonPath('data.assets.total', 2)
            ->assertJsonPath('data.assets.available', 1)
            ->assertJsonPath('data.assets.in_maintenance', 1)
            ->assertJsonPath('data.incidents.critical', 1)
            ->assertJsonPath('data.maintenances.total_cost', 250.50);
    }
}
