<?php

namespace Tests\Feature\Security;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RateLimitingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    public function test_auth_endpoints_are_rate_limited_after_too_many_attempts(): void
    {
        // Realizar 5 intentos de inicio de sesión fallidos (el límite permitido por minuto)
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/v1/auth/login', [
                'email' => 'hacker@example.com',
                'password' => 'wrongpassword',
            ]);

            $response->assertStatus(422);
        }

        // El 6to intento debe ser bloqueado con HTTP 429 Too Many Requests
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'hacker@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(429);
    }

    public function test_authenticated_api_routes_include_rate_limiting_headers(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/auth/me');

        $response->assertStatus(200);
        $response->assertHeader('X-RateLimit-Limit');
        $response->assertHeader('X-RateLimit-Remaining');
    }
}
