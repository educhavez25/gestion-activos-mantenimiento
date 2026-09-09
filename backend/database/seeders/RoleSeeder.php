<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'Administrador', 'slug' => 'administrador'],
            ['name' => 'Supervisor', 'slug' => 'supervisor'],
            ['name' => 'Técnico', 'slug' => 'tecnico'],
            ['name' => 'Usuario', 'slug' => 'usuario'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['slug' => $role['slug']], $role);
        }
    }
}
