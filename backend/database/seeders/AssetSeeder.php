<?php

namespace Database\Seeders;

use App\Models\Asset;
use Illuminate\Database\Seeder;

class AssetSeeder extends Seeder
{
    public function run(): void
    {
        Asset::factory()->count(15)->create();
        Asset::factory()->count(5)->assigned()->create();
        Asset::factory()->count(2)->retired()->create();
    }
}
