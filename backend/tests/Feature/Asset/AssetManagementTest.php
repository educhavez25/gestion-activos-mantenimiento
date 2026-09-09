<?php

namespace Tests\Feature\Asset;

use App\Enums\AssetStatus;
use App\Models\Asset;
use App\Models\Category;
use App\Models\Location;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssetManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $supervisor;

    protected User $user;

    protected Category $category;

    protected Location $location;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);

        $adminRole = Role::where('slug', 'administrador')->firstOrFail();
        $supervisorRole = Role::where('slug', 'supervisor')->firstOrFail();
        $userRole = Role::where('slug', 'usuario')->firstOrFail();

        $this->admin = User::factory()->create(['role_id' => $adminRole->id]);
        $this->supervisor = User::factory()->create(['role_id' => $supervisorRole->id]);
        $this->user = User::factory()->create(['role_id' => $userRole->id]);

        $this->category = Category::create(['name' => 'Laptops', 'description' => 'Equipos portátiles']);
        $this->location = Location::create(['name' => 'Oficina Central', 'description' => 'Sede principal']);
    }

    public function test_authenticated_user_can_list_assets(): void
    {
        Asset::create([
            'code' => 'LAP-001',
            'name' => 'ThinkPad T14',
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
            'status' => AssetStatus::Available,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/assets');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'code', 'name', 'status', 'category', 'location'],
                ],
                'links',
                'meta',
            ]);
    }

    public function test_supervisor_can_create_asset_with_action_rules(): void
    {
        $payload = [
            'code' => 'LAP-002',
            'name' => 'MacBook Pro 14',
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
            'assigned_to' => $this->user->id,
        ];

        $response = $this->actingAs($this->supervisor, 'sanctum')
            ->postJson('/api/v1/assets', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.code', 'LAP-002')
            ->assertJsonPath('data.status', AssetStatus::Assigned->value);

        $this->assertDatabaseHas('assets', [
            'code' => 'LAP-002',
            'status' => AssetStatus::Assigned->value,
            'assigned_to' => $this->user->id,
        ]);
    }

    public function test_regular_user_cannot_create_asset(): void
    {
        $payload = [
            'code' => 'LAP-003',
            'name' => 'Dell XPS',
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
        ];

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/assets', $payload);

        $response->assertStatus(403);
    }

    public function test_supervisor_can_update_asset(): void
    {
        $asset = Asset::create([
            'code' => 'LAP-004',
            'name' => 'HP EliteBook',
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
            'status' => AssetStatus::Available,
        ]);

        $response = $this->actingAs($this->supervisor, 'sanctum')
            ->putJson("/api/v1/assets/{$asset->id}", [
                'code' => 'LAP-004', // Same code should not trigger unique validation error
                'name' => 'HP EliteBook Updated',
                'category_id' => $this->category->id,
                'location_id' => $this->location->id,
                'status' => AssetStatus::Retired->value,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'HP EliteBook Updated')
            ->assertJsonPath('data.status', AssetStatus::Retired->value);
    }

    public function test_admin_can_delete_asset_while_others_cannot(): void
    {
        $asset = Asset::create([
            'code' => 'LAP-005',
            'name' => 'Lenovo Legion',
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
            'status' => AssetStatus::Available,
        ]);

        // Supervisor cannot delete
        $responseSupervisor = $this->actingAs($this->supervisor, 'sanctum')
            ->deleteJson("/api/v1/assets/{$asset->id}");
        $responseSupervisor->assertStatus(403);

        // Admin can delete (via Gate::before super-admin bypass)
        $responseAdmin = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/v1/assets/{$asset->id}");
        $responseAdmin->assertStatus(200);

        $this->assertSoftDeleted('assets', ['id' => $asset->id]);
    }

    public function test_user_can_search_assets_by_code_or_name(): void
    {
        Asset::create([
            'code' => 'SRV-001',
            'name' => 'Servidor Dell PowerEdge',
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
            'status' => AssetStatus::Available,
        ]);

        Asset::create([
            'code' => 'MNT-002',
            'name' => 'Monitor LG 27',
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
            'status' => AssetStatus::Available,
        ]);

        // Search by code
        $responseByCode = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/assets?search=SRV');

        $responseByCode->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.code', 'SRV-001');

        // Search by name
        $responseByName = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/assets?search=Monitor');

        $responseByName->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Monitor LG 27');
    }

    public function test_user_can_filter_assets_by_status(): void
    {
        Asset::create([
            'code' => 'AST-101',
            'name' => 'Asset Disponible',
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
            'status' => AssetStatus::Available,
        ]);

        Asset::create([
            'code' => 'AST-102',
            'name' => 'Asset Retirado',
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
            'status' => AssetStatus::Retired,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/assets?status=retired');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.code', 'AST-102');
    }

    public function test_user_can_sort_assets(): void
    {
        Asset::create([
            'code' => 'AST-AAA',
            'name' => 'Alfa Laptop',
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
            'status' => AssetStatus::Available,
        ]);

        Asset::create([
            'code' => 'AST-ZZZ',
            'name' => 'Zeta Laptop',
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
            'status' => AssetStatus::Available,
        ]);

        // Ascending sort by name
        $responseAsc = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/assets?sort=name');

        $responseAsc->assertStatus(200)
            ->assertJsonPath('data.0.name', 'Alfa Laptop');

        // Descending sort by name
        $responseDesc = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/assets?sort=-name');

        $responseDesc->assertStatus(200)
            ->assertJsonPath('data.0.name', 'Zeta Laptop');
    }
}
