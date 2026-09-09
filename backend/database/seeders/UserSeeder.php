<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('slug', 'administrador')->first();
        $supervisorRole = Role::where('slug', 'supervisor')->first();
        $technicianRole = Role::where('slug', 'tecnico')->first();
        $userRole = Role::where('slug', 'usuario')->first();

        $demoUsers = [
            [
                'name' => 'Admin Principal',
                'email' => 'admin@example.com',
                'password' => Hash::make('password'),
                'role_id' => $adminRole?->id,
            ],
            [
                'name' => 'Supervisor de Mantenimiento',
                'email' => 'supervisor@example.com',
                'password' => Hash::make('password'),
                'role_id' => $supervisorRole?->id,
            ],
            [
                'name' => 'Técnico Especialista',
                'email' => 'tecnico@example.com',
                'password' => Hash::make('password'),
                'role_id' => $technicianRole?->id,
            ],
            [
                'name' => 'Usuario Operador',
                'email' => 'usuario@example.com',
                'password' => Hash::make('password'),
                'role_id' => $userRole?->id,
            ],
        ];

        foreach ($demoUsers as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }
    }
}
