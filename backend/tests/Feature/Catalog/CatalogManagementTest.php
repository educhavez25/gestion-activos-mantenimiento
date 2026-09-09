<?php

namespace Tests\Feature\Catalog;

use App\Models\Location;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogManagementTest extends TestCase
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

    public function test_user_can_list_and_create_categories(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/categories', [
                'name' => 'Tablets',
                'description' => 'Dispositivos táctiles portátiles',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Tablets');

        $listResponse = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/categories');

        $listResponse->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Tablets');
    }

    public function test_user_can_create_and_list_nested_locations(): void
    {
        $parent = Location::create([
            'name' => 'Edificio A',
            'description' => 'Sede central',
        ]);

        $childResponse = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/locations', [
                'name' => 'Piso 2 - Sala de Juntas',
                'description' => 'Área de reuniones',
                'parent_location_id' => $parent->id,
            ]);

        $childResponse->assertStatus(201)
            ->assertJsonPath('data.name', 'Piso 2 - Sala de Juntas')
            ->assertJsonPath('data.parent.id', $parent->id);
    }

    public function test_user_can_filter_users_by_role(): void
    {
        $techRole = Role::where('slug', 'tecnico')->firstOrFail();
        $supervisorRole = Role::where('slug', 'supervisor')->firstOrFail();

        User::factory()->create(['name' => 'Carlos Técnico', 'role_id' => $techRole->id]);
        User::factory()->create(['name' => 'Laura Supervisor', 'role_id' => $supervisorRole->id]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/users?role=tecnico');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Carlos Técnico');
    }

    public function test_user_can_list_all_roles(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/roles');

        $response->assertStatus(200)
            ->assertJsonCount(4, 'data'); // administrador, supervisor, tecnico, usuario
    }
}
