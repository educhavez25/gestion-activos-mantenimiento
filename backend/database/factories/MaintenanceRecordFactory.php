<?php

namespace Database\Factories;

use App\Enums\MaintenanceStatus;
use App\Enums\MaintenanceType;
use App\Models\Asset;
use Illuminate\Database\Eloquent\Factories\Factory;

class MaintenanceRecordFactory extends Factory
{
    public function definition(): array
    {
        return [
            'asset_id' => Asset::factory(),
            'type' => MaintenanceType::Preventive,
            'status' => MaintenanceStatus::Completed,
            'scheduled_date' => fake()->dateTimeBetween('-6 months', 'now'),
            'completed_date' => fake()->dateTimeBetween('-6 months', 'now'),
            'performed_by' => null,
            'description' => fake()->sentence(),
            'cost' => fake()->randomFloat(2, 20, 500),
        ];
    }

    public function corrective(): self
    {
        return $this->state(fn () => [
            'type' => MaintenanceType::Corrective,
            'scheduled_date' => null,
        ]);
    }

    public function active(): self
    {
        return $this->state(fn () => [
            'status' => MaintenanceStatus::Scheduled,
            'completed_date' => null,
        ]);
    }
}
