<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'General',      // ID 1 (Importante para que no falle tu Controller)
            'Camisetas',    // ID 2
            'Pantalones',   // ID 3
            'Vestidos',     // ID 4
            'Zapatos',      // ID 5
            'Accesorios',   // ID 6
            'Chamarras',    // ID 7
            'Deportivo',    // ID 8
            'Formal',       // ID 9
            'Trajes de Baño', // ID 10
        ];

        foreach ($categories as $categoryName) {
            // firstOrCreate evita que se dupliquen si corres el seeder dos veces
            Category::firstOrCreate([
                'name' => $categoryName
            ]);
        }
    }
}