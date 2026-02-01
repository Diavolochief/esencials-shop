<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

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
        // 1. OBTENER EL CARRITO DE LA SESIÓN
        $cart = $request->session()->get('cart', []);

        // 2. CALCULAR CONTEO Y TOTAL (ESTO FUE LO QUE TE FALTÓ)
        $cartCount = array_reduce($cart, fn($count, $item) => $count + $item['quantity'], 0);
        $cartTotal = array_reduce($cart, fn($sum, $item) => $sum + ($item['price'] * $item['quantity']), 0);

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            // 3. COMPARTIMOS LA VARIABLE CALCULADA ARRIBA
            'cart_global' => [
                'count' => $cartCount, // <--- Aquí ya no dará error
                'total' => $cartTotal,
                'items' => $cart
            ],
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