<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class RoleFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->randomElement(['Administrador', 'Supervisor', 'Técnico', 'Usuario']);

        return [
            'name' => $name,
            'slug' => Str::slug($name),
        ];
    }
}
