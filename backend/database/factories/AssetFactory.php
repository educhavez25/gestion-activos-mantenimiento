<?php

namespace Database\Factories;

use App\Enums\AssetStatus;
use App\Models\Category;
use App\Models\Location;
use Illuminate\Database\Eloquent\Factories\Factory;

class AssetFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => strtoupper(fake()->unique()->bothify('AST-####')),
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'category_id' => Category::query()->inRandomOrder()->value('id') ?? Category::factory(),
            'location_id' => Location::query()->inRandomOrder()->value('id') ?? Location::factory(),
            'assigned_to' => null,
            'status' => AssetStatus::Available,
            'purchase_date' => fake()->dateTimeBetween('-3 years', 'now'),
            'warranty_expiration' => fake()->dateTimeBetween('now', '+2 years'),
        ];
    }

    public function assigned(): self
    {
        return $this->state(fn () => [
            'status' => AssetStatus::Assigned,
        ]);
    }

    public function retired(): self
    {
        return $this->state(fn () => [
            'status' => AssetStatus::Retired,
            'assigned_to' => null,
        ]);
    }
}
