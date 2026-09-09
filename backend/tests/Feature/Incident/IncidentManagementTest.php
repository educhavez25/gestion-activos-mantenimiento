<?php

namespace Tests\Feature\Incident;

use App\Enums\AssetStatus;
use App\Enums\IncidentSeverity;
use App\Enums\IncidentStatus;
use App\Events\CriticalIncidentReported;
use App\Models\Asset;
use App\Models\Category;
use App\Models\Incident;
use App\Models\Location;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class IncidentManagementTest extends TestCase
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

        $category = Category::create(['name' => 'Laptops', 'description' => 'Equipos']);
        $location = Location::create(['name' => 'Piso 1', 'description' => 'Oficinas']);

        $this->asset = Asset::create([
            'code' => 'AST-INC-01',
            'name' => 'Workstation HP',
            'category_id' => $category->id,
            'location_id' => $location->id,
            'status' => AssetStatus::Available,
        ]);
    }

    public function test_user_can_create_incident(): void
    {
        $payload = [
            'asset_id' => $this->asset->id,
            'severity' => IncidentSeverity::Medium->value,
            'description' => 'La pantalla parpadea constantemente al encender el equipo.',
        ];

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/incidents', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.severity', IncidentSeverity::Medium->value)
            ->assertJsonPath('data.status', IncidentStatus::Open->value)
            ->assertJsonPath('data.reported_by', $this->user->id);

        $this->assertDatabaseHas('incidents', [
            'asset_id' => $this->asset->id,
            'reported_by' => $this->user->id,
            'severity' => IncidentSeverity::Medium->value,
        ]);
    }

    public function test_critical_incident_changes_asset_status_to_maintenance(): void
    {
        Event::fake([CriticalIncidentReported::class]);

        $payload = [
            'asset_id' => $this->asset->id,
            'severity' => IncidentSeverity::Critical->value,
            'description' => 'Humo saliendo de la fuente de poder del servidor.',
        ];

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/incidents', $payload);

        $response->assertStatus(201);

        $this->assertEquals(
            AssetStatus::InMaintenance,
            $this->asset->fresh()->status
        );

        Event::assertDispatched(CriticalIncidentReported::class);
    }

    public function test_assigned_technician_can_resolve_incident(): void
    {
        $incident = Incident::create([
            'asset_id' => $this->asset->id,
            'reported_by' => $this->user->id,
            'assigned_to' => $this->technician->id,
            'severity' => IncidentSeverity::High,
            'status' => IncidentStatus::InProgress,
            'description' => 'Fallo en disco duro.',
        ]);

        $payload = [
            'status' => IncidentStatus::Resolved->value,
            'resolution_notes' => 'Se reemplazó el disco por un SSD NVMe y se clonó el sistema operativo.',
        ];

        $response = $this->actingAs($this->technician, 'sanctum')
            ->patchJson("/api/v1/incidents/{$incident->id}/status", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', IncidentStatus::Resolved->value)
            ->assertJsonPath('data.resolution_notes', $payload['resolution_notes']);

        $this->assertNotNull($incident->fresh()->resolved_at);
    }

    public function test_unauthorized_user_cannot_update_incident_status(): void
    {
        $incident = Incident::create([
            'asset_id' => $this->asset->id,
            'reported_by' => $this->user->id,
            'assigned_to' => $this->technician->id,
            'severity' => IncidentSeverity::Low,
            'status' => IncidentStatus::Open,
            'description' => 'Teclado sucio.',
        ]);

        $otherUser = User::factory()->create(['role_id' => $this->user->role_id]);

        $response = $this->actingAs($otherUser, 'sanctum')
            ->patchJson("/api/v1/incidents/{$incident->id}/status", [
                'status' => IncidentStatus::Resolved->value,
                'resolution_notes' => 'Intentando resolver sin ser técnico.',
            ]);

        $response->assertStatus(403);
    }

    public function test_user_can_filter_incidents(): void
    {
        Incident::create([
            'asset_id' => $this->asset->id,
            'reported_by' => $this->supervisor->id,
            'severity' => IncidentSeverity::Low,
            'status' => IncidentStatus::Open,
            'description' => 'Incidencia leve',
        ]);

        Incident::create([
            'asset_id' => $this->asset->id,
            'reported_by' => $this->supervisor->id,
            'severity' => IncidentSeverity::Critical,
            'status' => IncidentStatus::Closed,
            'description' => 'Incidencia crítica cerrada',
        ]);

        $response = $this->actingAs($this->supervisor, 'sanctum')
            ->getJson('/api/v1/incidents?severity=critical');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.severity', IncidentSeverity::Critical->value);
    }
}
