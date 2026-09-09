<?php

namespace Tests\Feature\Maintenance;

use App\Enums\AssetStatus;
use App\Enums\MaintenanceStatus;
use App\Enums\MaintenanceType;
use App\Models\Asset;
use App\Models\Category;
use App\Models\Location;
use App\Models\MaintenanceRecord;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MaintenanceManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $supervisor;

    protected User $technician;

    protected User $user;

    protected Asset $asset;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);

        $adminRole = Role::where('slug', 'administrador')->firstOrFail();
        $supervisorRole = Role::where('slug', 'supervisor')->firstOrFail();
        $techRole = Role::where('slug', 'tecnico')->firstOrFail();
        $userRole = Role::where('slug', 'usuario')->firstOrFail();

        $this->admin = User::factory()->create(['role_id' => $adminRole->id]);
        $this->supervisor = User::factory()->create(['role_id' => $supervisorRole->id]);
        $this->technician = User::factory()->create(['role_id' => $techRole->id]);
        $this->user = User::factory()->create(['role_id' => $userRole->id]);

        $category = Category::create(['name' => 'Servidores', 'description' => 'Infraestructura']);
        $location = Location::create(['name' => 'Datacenter', 'description' => 'Sala de racks']);

        $this->asset = Asset::create([
            'code' => 'SRV-MNT-01',
            'name' => 'Rack Server Dell R740',
            'category_id' => $category->id,
            'location_id' => $location->id,
            'status' => AssetStatus::Available,
        ]);
    }

    public function test_supervisor_can_schedule_maintenance(): void
    {
        $payload = [
            'asset_id' => $this->asset->id,
            'type' => MaintenanceType::Preventive->value,
            'status' => MaintenanceStatus::Scheduled->value,
            'scheduled_date' => now()->addDays(7)->toDateString(),
            'performed_by' => $this->technician->id,
            'description' => 'Limpieza de ventiladores y cambio de pasta térmica.',
            'cost' => 150.00,
        ];

        $response = $this->actingAs($this->supervisor, 'sanctum')
            ->postJson('/api/v1/maintenances', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.type', MaintenanceType::Preventive->value)
            ->assertJsonPath('data.status', MaintenanceStatus::Scheduled->value)
            ->assertJsonPath('data.cost', '150.00');

        $this->assertDatabaseHas('maintenance_records', [
            'asset_id' => $this->asset->id,
            'type' => MaintenanceType::Preventive->value,
            'status' => MaintenanceStatus::Scheduled->value,
        ]);
    }

    public function test_cannot_schedule_overlapping_maintenance_for_same_asset(): void
    {
        MaintenanceRecord::create([
            'asset_id' => $this->asset->id,
            'type' => MaintenanceType::Preventive,
            'status' => MaintenanceStatus::Scheduled,
            'scheduled_date' => now()->addDays(2)->toDateString(),
            'description' => 'Mantenimiento preventivo en cola.',
        ]);

        $payload = [
            'asset_id' => $this->asset->id,
            'type' => MaintenanceType::Corrective->value,
            'scheduled_date' => now()->addDays(3)->toDateString(),
            'description' => 'Intento de segundo mantenimiento.',
        ];

        $response = $this->actingAs($this->supervisor, 'sanctum')
            ->postJson('/api/v1/maintenances', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('asset_id');
    }

    public function test_in_progress_maintenance_sets_asset_to_in_maintenance(): void
    {
        $maintenance = MaintenanceRecord::create([
            'asset_id' => $this->asset->id,
            'type' => MaintenanceType::Preventive,
            'status' => MaintenanceStatus::Scheduled,
            'scheduled_date' => now()->toDateString(),
            'description' => 'Mantenimiento preventivo.',
        ]);

        $response = $this->actingAs($this->supervisor, 'sanctum')
            ->putJson("/api/v1/maintenances/{$maintenance->id}", [
                'type' => MaintenanceType::Preventive->value,
                'status' => MaintenanceStatus::InProgress->value,
                'scheduled_date' => now()->toDateString(),
                'description' => 'Iniciando labores técnicas.',
            ]);

        $response->assertStatus(200);

        $this->assertEquals(AssetStatus::InMaintenance, $this->asset->fresh()->status);
    }

    public function test_completing_maintenance_restores_asset_status(): void
    {
        $this->asset->update(['status' => AssetStatus::InMaintenance]);

        $maintenance = MaintenanceRecord::create([
            'asset_id' => $this->asset->id,
            'type' => MaintenanceType::Corrective,
            'status' => MaintenanceStatus::InProgress,
            'scheduled_date' => now()->toDateString(),
            'description' => 'Reparación de fuente redundante.',
            'performed_by' => $this->technician->id,
        ]);

        $response = $this->actingAs($this->technician, 'sanctum')
            ->putJson("/api/v1/maintenances/{$maintenance->id}", [
                'type' => MaintenanceType::Corrective->value,
                'status' => MaintenanceStatus::Completed->value,
                'scheduled_date' => now()->toDateString(),
                'completed_date' => now()->toDateString(),
                'performed_by' => $this->technician->id,
                'description' => 'Fuente sustituida exitosamente.',
                'cost' => 300.00,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', MaintenanceStatus::Completed->value);

        $this->assertEquals(AssetStatus::Available, $this->asset->fresh()->status);
    }

    public function test_regular_user_cannot_create_maintenance(): void
    {
        $payload = [
            'asset_id' => $this->asset->id,
            'type' => MaintenanceType::Preventive->value,
            'scheduled_date' => now()->addDays(5)->toDateString(),
            'description' => 'Usuario regular intentando programar mantenimiento.',
        ];

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/maintenances', $payload);

        $response->assertStatus(403);
    }

    public function test_user_can_filter_maintenances(): void
    {
        MaintenanceRecord::create([
            'asset_id' => $this->asset->id,
            'type' => MaintenanceType::Preventive,
            'status' => MaintenanceStatus::Scheduled,
            'scheduled_date' => now()->addDays(1)->toDateString(),
            'description' => 'Mantenimiento 1',
        ]);

        MaintenanceRecord::create([
            'asset_id' => $this->asset->id,
            'type' => MaintenanceType::Corrective,
            'status' => MaintenanceStatus::Completed,
            'scheduled_date' => now()->subDays(5)->toDateString(),
            'description' => 'Mantenimiento 2',
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/maintenances?type=corrective');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.type', MaintenanceType::Corrective->value);
    }
}
