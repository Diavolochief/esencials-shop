<?php

namespace App\Imports;

use App\Models\Product;
use App\Models\ProductImage;
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
        // Convertimos la fila a un array
        $rowArray = $row->toArray();

        // 🔥 VALIDACIÓN CRÍTICA: Si el campo 'nombre' está vacío, ignora esta fila por completo.
        // Esto evita que las filas "fantasma" de Excel causen el error de Column 'name' cannot be null.
        if (!isset($rowArray['nombre']) || empty(trim($rowArray['nombre']))) {
            return null;
        }

        // 1. Procesar la Imagen Principal (Portada)
        $imageUrl = null;
        $imageName = isset($rowArray['image_url']) ? trim($rowArray['image_url']) : null;

        if ($imageName && isset($this->images[$imageName])) {
            $path = $this->images[$imageName]->store('products', 'public');
            $imageUrl = asset('storage/' . $path);
        }

        // 2. Crear el Producto (Usamos el array verificado)
        $product = Product::create([
            'user_id'     => Auth::id(),
            'name'        => $rowArray['nombre'],
            'price'       => $rowArray['precio'] ?? 0,
            'cost_price'  => $rowArray['cost_price'] ?? 0,
            'stock'       => $rowArray['stock'] ?? 0,
            'category_id' => $rowArray['categoria_id'], 
            'condition'   => $rowArray['condicion'] ?? 'Nuevo',
            'description' => $rowArray['descripcion'] ?? '',
            'image_url'   => $imageUrl ?? '',          
            'is_sold'     => false,
            'sold_count'  => 0,
            'is_active'   => true,
        ]);

        // 3. Procesar la Galería Secundaria
        $galleryNames = isset($rowArray['gallery']) ? trim($rowArray['gallery']) : null;
        
        if ($galleryNames) {
            $namesArray = explode(',', $galleryNames);
            
            foreach ($namesArray as $gName) {
                $gName = trim($gName);
                
                if ($gName && isset($this->images[$gName])) {
                    $path = $this->images[$gName]->store('products/gallery', 'public');
                    
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_url'  => asset('storage/' . $path),
                    ]);
                }
            }
        }
    }
}