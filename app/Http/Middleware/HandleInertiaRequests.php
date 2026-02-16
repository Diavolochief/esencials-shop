<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;
use App\Models\Product; // <--- AGREGADO: Importar el modelo

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // 1. OBTENER EL CARRITO DE LA SESIÓN (TU LÓGICA INTACTA)
        $cart = $request->session()->get('cart', []);

        // 2. CALCULAR CONTEO Y TOTAL (TU LÓGICA INTACTA)
        $cartCount = array_reduce($cart, fn($count, $item) => $count + $item['quantity'], 0);
        $cartTotal = array_reduce($cart, fn($sum, $item) => $sum + ($item['price'] * $item['quantity']), 0);

        return [
            ...parent::share($request),
            
            'auth' => [
                'user' => $request->user(),
            ],

            // 3. TU VARIABLE DE CARRITO GLOBAL
            'cart_global' => [
                'count' => $cartCount,
                'total' => $cartTotal,
                'items' => $cart
            ],

            // 4. AGREGADO: LISTA DE PRODUCTOS PARA EL BUSCADOR GLOBAL
            // Usamos una función anónima para que solo se ejecute la consulta si se usa
            'searchable_products' => function () {
                return Product::where('is_active', true)
                    ->select('id', 'name', 'price', 'image_url', 'category_id') // Solo lo necesario
                    ->with('category:id,name') 
                    ->get();
            },

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
            ],

            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
        ];
    }
}