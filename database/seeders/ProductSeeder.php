<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;
use App\Models\User;
use App\Models\Review; // Importar modelo Review

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Obtener usuario vendedor
        $user = User::first();
        if (!$user) {
            $user = User::factory()->create([
                'name' => 'Admin Vendedor',
                'email' => 'admin@test.com',
                'password' => bcrypt('password')
            ]);
        }

        // 2. Datos de Productos (15 items)
        $products = [
            ['name' => 'Camiseta Básica Negra', 'cat' => 'Camisetas', 'price' => 250, 'color' => '1a1a1a'],
            ['name' => 'Jeans Slim Fit', 'cat' => 'Pantalones', 'price' => 600, 'color' => '264653'],
            ['name' => 'Vestido Floral', 'cat' => 'Vestidos', 'price' => 850, 'color' => 'e9c46a'],
            ['name' => 'Sneakers Urbanos', 'cat' => 'Zapatos', 'price' => 1100, 'color' => 'adb5bd'],
            ['name' => 'Reloj Digital', 'cat' => 'Accesorios', 'price' => 350, 'color' => '212529'],
            ['name' => 'Chamarra Denim', 'cat' => 'Chamarras', 'price' => 900, 'color' => '457b9d'],
            ['name' => 'Bikini Tropical', 'cat' => 'Trajes de Baño', 'price' => 500, 'color' => 'fb8500'],
            ['name' => 'Hoodie Gris', 'cat' => 'Deportivo', 'price' => 600, 'color' => '6c757d'],
            ['name' => 'Camisa Formal', 'cat' => 'Formal', 'price' => 650, 'color' => 'ffffff'],
            ['name' => 'Gorra Trucker', 'cat' => 'Accesorios', 'price' => 150, 'color' => '000000'],
            ['name' => 'Botas de Piel', 'cat' => 'Zapatos', 'price' => 1500, 'color' => '583101'],
            ['name' => 'Blazer Marino', 'cat' => 'Formal', 'price' => 1800, 'color' => '1d3557'],
            ['name' => 'Vestido Noche', 'cat' => 'Vestidos', 'price' => 1200, 'color' => '000000'],
            ['name' => 'Playera Retro', 'cat' => 'Camisetas', 'price' => 180, 'color' => 'e76f51'],
            ['name' => 'Shorts Running', 'cat' => 'Deportivo', 'price' => 300, 'color' => '2a9d8f'],
        ];

        foreach ($products as $item) {
            // Buscar categoría ID
            $cat = Category::where('name', $item['cat'])->first();
            $catId = $cat ? $cat->id : 1;
            
            // Generar URL Imagen
            $bg = $item['color'];
            $txt = ($bg === 'ffffff' || $bg === 'e9c46a' || $bg === 'adb5bd') ? '000000' : 'ffffff';
            $nameUrl = str_replace(' ', '+', $item['name']);
            $imgUrl = "https://placehold.co/600x600/{$bg}/{$txt}?text={$nameUrl}";

            // Crear Producto
            $product = Product::create([
                'user_id' => $user->id,
                'category_id' => $catId,
                'name' => $item['name'],
                'description' => 'Descripción generada automáticamente para ' . $item['name'],
                'price' => $item['price'],
                'stock' => rand(5, 50),
                'sold_count' => rand(0, 300), // <--- Ventas aleatorias para probar "Más Vendido"
                'condition' => 'nuevo',
                'image_url' => $imgUrl,
                'is_sold' => false,
                'is_active' => true,
            ]);

            // GENERAR REVIEWS FALSAS PARA ESTE PRODUCTO
            // Creamos entre 0 y 5 reviews por producto
            $numReviews = rand(0, 5);
            for ($i = 0; $i < $numReviews; $i++) {
                Review::create([
                    'user_id' => $user->id, // El mismo admin comenta (solo demo)
                    'product_id' => $product->id,
                    'rating' => rand(3, 5), // Calificaciones altas
                    'comment' => 'Excelente producto, muy recomendado.',
                ]);
            }
        }
    }
}