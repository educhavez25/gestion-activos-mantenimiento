<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    public function test_a_user_can_register_with_valid_data(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Ana Test',
            'email' => 'ana@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => ['user' => ['id', 'name', 'email'], 'token'],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'ana@example.com',
        ]);
    }

    public function test_registration_fails_with_invalid_email(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Ana Test',
            'email' => 'not-an-email',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    public function test_registration_fails_when_email_already_exists(): void
    {
        User::factory()->create(['email' => 'ana@example.com']);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Otra Ana',
            'email' => 'ana@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    public function test_a_user_can_login_with_correct_credentials(): void
    {
        User::factory()->create([
            'email' => 'ana@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'ana@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['user' => ['id', 'email'], 'token'],
            ]);
    }

    public function test_login_fails_with_incorrect_password(): void
    {
        User::factory()->create([
            'email' => '[email protected]',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => '[email protected]',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    public function test_an_authenticated_user_can_access_the_me_endpoint(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJson([
                'data' => ['id' => $user->id, 'email' => $user->email],
            ]);
    }

    public function test_a_guest_cannot_access_the_me_endpoint(): void
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(401);
    }

    public function test_a_user_can_logout_and_the_token_is_revoked(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $logoutResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/auth/logout');

        $logoutResponse->assertStatus(200);

        $meResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/auth/me');

        $meResponse->assertStatus(401);
    }
}
