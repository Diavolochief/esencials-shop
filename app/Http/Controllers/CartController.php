<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class CartController extends Controller
{
    // 1. Mostrar vista del carrito
    public function index()
    {
        $cart = session()->get('cart', []);
        $total = array_reduce($cart, fn($sum, $item) => $sum + ($item['price'] * $item['quantity']), 0);

        return Inertia::render('Cart/Index', [
            'cart' => $cart,
            'total' => $total
        ]);
    }

    // 2. Agregar producto
    public function add(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $cart = session()->get('cart', []);

        // Si ya existe, sumamos cantidad
        if (isset($cart[$id])) {
            $cart[$id]['quantity']++;
        } else {
            // Si no, lo agregamos
            $cart[$id] = [
                'id' => $product->id,
                'name' => $product->name,
                'price' => $product->price,
                'image_url' => $product->image_url,
                'quantity' => 1,
                'stock' => $product->stock // Guardamos stock para validar
            ];
        }

        session()->put('cart', $cart);
        return Redirect::back()->with('success', 'Producto agregado al carrito.');
    }

    // 3. Actualizar cantidad (+ / -)
    public function update(Request $request)
    {
        if ($request->id && $request->quantity) {
            $cart = session()->get('cart');
            $cart[$request->id]['quantity'] = $request->quantity;
            session()->put('cart', $cart);
        }
        return Redirect::back();
    }

    // 4. Eliminar del carrito
    public function remove(Request $request)
    {
        if ($request->id) {
            $cart = session()->get('cart');
            if (isset($cart[$request->id])) {
                unset($cart[$request->id]);
                session()->put('cart', $cart);
            }
        }
        return Redirect::back()->with('success', 'Producto eliminado del carrito.');
    }
}