<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class LocationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'parent_location_id' => null,
            'name' => fake()->unique()->streetName(),
            'description' => fake()->sentence(),
        ];
    }
}
