<?php

namespace App\Imports;

use App\Models\Product;
use App\Models\ProductImage; // <-- IMPORTANTE: Importar el modelo de la galería
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Row;
use Maatwebsite\Excel\Concerns\OnEachRow;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ProductsImport implements OnEachRow, WithHeadingRow
{
    protected $images;

    public function __construct($images = [])
    {
        $this->images = $images;
    }

    public function onRow(Row $row)
    {
        // Convertimos la fila a un array manejable
        $row = $row->toArray();

        // 1. Procesar la Imagen Principal (Portada)
        $imageUrl = null;
        $imageName = isset($row['image_url']) ? trim($row['image_url']) : null;

        if ($imageName && isset($this->images[$imageName])) {
            $path = $this->images[$imageName]->store('products', 'public');
            $imageUrl = asset('storage/' . $path);
        }

        // 2. Crear el Producto
        $product = Product::create([
            'user_id'     => Auth::id(),
            'name'        => $row['nombre'],
            'price'       => $row['precio'],
            'stock'       => $row['stock'],
            'category_id' => $row['categoria_id'], 
            'condition'   => $row['condicion'] ?? 'Nuevo',
            'description' => $row['descripcion'] ?? '',
            'image_url'   => $imageUrl ?? '', //           
            'is_sold'     => false,
            'sold_count'  => 0,
            'is_active'   => true,
        ]);

        // 3. Procesar la Galería Secundaria (Si existe)
        $galleryNames = isset($row['gallery']) ? trim($row['gallery']) : null;
        
        if ($galleryNames) {
            // Separamos los nombres por comas
            $namesArray = explode(',', $galleryNames);
            
            foreach ($namesArray as $gName) {
                $gName = trim($gName); // Quitamos espacios en blanco accidentales
                
                // Si el nombre existe y subimos la foto en el React...
                if ($gName && isset($this->images[$gName])) {
                    $path = $this->images[$gName]->store('products/gallery', 'public');
                    
                    // Guardamos la foto en la tabla relacional
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_url'  => asset('storage/' . $path),
                    ]);
                }
            }
        }
    }
}