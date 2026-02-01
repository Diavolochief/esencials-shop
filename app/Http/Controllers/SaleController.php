<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Client;
use App\Models\Product; // <--- Importamos Product para manejar stock
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;

class SaleController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validar
        $request->validate([
            'client_name' => 'required|string|max:255',
            'concept' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'product_id' => 'nullable|exists:products,id', // <--- Agregamos validación opcional
        ]);

        $userId = Auth::id();

        // 2. Buscar o Crear el cliente
        // Buscamos un cliente que tenga este nombre Y pertenezca a este usuario (vendedor)
        $client = Client::firstOrCreate(
            [
                'user_id' => $userId, 
                'name' => $request->client_name
            ]
        );

        // 3. Lógica de Categoría y Stock
        $categoryId = 1; // Por defecto: Categoría Genérica
        $productId = null;

        // Si el usuario seleccionó un producto del inventario:
        if ($request->product_id) {
            $product = Product::find($request->product_id);
            
            if ($product) {
                // Validación de Stock
                if ($product->stock < 1) {
                    return Redirect::back()->with('error', 'Error: No hay stock suficiente para este producto.');
                }

                // Descontar inventario y aumentar contador de vendidos
                $product->decrement('stock');
                $product->increment('sold_count');

                // Usar la categoría real del producto y su ID
                $categoryId = $product->category_id;
                $productId = $product->id;
            }
        }

        // 4. Crear la venta
        Sale::create([
            'user_id' => $userId,
            'client_id' => $client->id, // <--- CORRECCIÓN: Usamos el ID del cliente creado/encontrado
            'product_id' => $productId,
            'category_id' => $categoryId, // Guardamos la categoría (1 o la del producto)
            'concept' => $request->concept,
            'amount' => $request->amount,
            'is_manual' => true, 
        ]);

        return Redirect::back()->with('success', 'Venta registrada correctamente.');
    }
}