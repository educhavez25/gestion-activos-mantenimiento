<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Laptops',
            'Computadoras de escritorio',
            'Impresoras',
            'Mobiliario',
            'Climatización',
            'Redes y conectividad',
        ];

        foreach ($categories as $name) {
            Category::firstOrCreate(['name' => $name]);
        }
    }
}
