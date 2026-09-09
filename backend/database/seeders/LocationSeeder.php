<?php

namespace Database\Seeders;

use App\Models\Location;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $edificioPrincipal = Location::firstOrCreate(
            ['name' => 'Edificio Principal', 'parent_location_id' => null]
        );

        $piso1 = Location::firstOrCreate([
            'name' => 'Piso 1',
            'parent_location_id' => $edificioPrincipal->id,
        ]);

        Location::firstOrCreate([
            'name' => 'Sala de Sistemas',
            'parent_location_id' => $piso1->id,
        ]);

        Location::firstOrCreate([
            'name' => 'Recepción',
            'parent_location_id' => $piso1->id,
        ]);
    }
}
