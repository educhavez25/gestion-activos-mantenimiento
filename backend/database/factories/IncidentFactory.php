<?php

namespace Database\Factories;

use App\Enums\IncidentSeverity;
use App\Enums\IncidentStatus;
use App\Models\Asset;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class IncidentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'asset_id' => Asset::factory(),
            'reported_by' => User::factory(),
            'assigned_to' => null,
            'severity' => IncidentSeverity::Medium,
            'status' => IncidentStatus::Open,
            'description' => fake()->sentence(),
            'resolution_notes' => null,
            'resolved_at' => null,
        ];
    }

    public function critical(): self
    {
        return $this->state(fn () => [
            'severity' => IncidentSeverity::Critical,
        ]);
    }

    public function resolved(): self
    {
        return $this->state(fn () => [
            'status' => IncidentStatus::Resolved,
            'resolution_notes' => fake()->sentence(),
            'resolved_at' => now(),
        ]);
    }
}
