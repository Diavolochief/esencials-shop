<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Banner;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        $banners = [
            [
                'title' => 'Nueva Colección 2026',
                'bg' => '264653', // Azul petróleo
                'text_color' => 'ffffff',
                'order' => 1
            ],
            [
                'title' => 'Ofertas de Verano -50%',
                'bg' => 'e76f51', // Terracota
                'text_color' => 'ffffff',
                'order' => 2
            ],
            [
                'title' => 'Envío Gratis en todo México',
                'bg' => '2a9d8f', // Verde agua
                'text_color' => 'ffffff',
                'order' => 3
            ],
            [
                'title' => 'Moda Urbana y Accesorios',
                'bg' => '1d3557', // Azul marino
                'text_color' => 'ffffff',
                'order' => 4
            ],
            [
                'title' => 'Outlet Exclusivo',
                'bg' => '000000', // Negro
                'text_color' => 'ffffff',
                'order' => 5
            ],
        ];

        foreach ($banners as $b) {
            $text = str_replace(' ', '+', $b['title']);
            // Dimensiones 1200x450 para Hero Banners
            $url = "https://placehold.co/1200x450/{$b['bg']}/{$b['text_color']}?text={$text}";

            Banner::create([
                'image_url' => $url,
                'title' => $b['title'],
                'order' => $b['order'],
                'is_active' => true
            ]);
        }
    }
}