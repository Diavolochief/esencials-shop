<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Vista "Mis Compras" para el Cliente
     */
    public function myPurchases(Request $request)
    {
        // Cuando creemos la tabla, la consulta real será esta:
         $orders = Order::where('user_id', Auth::id())->orderBy('created_at', 'desc')->get();
        
        // Por ahora mandamos un array vacío para que el Frontend muestre el diseño de prueba
        $orders = [];

        return Inertia::render('MisCompras', [
            'orders' => $orders
        ]);
    }

    /**
     * El Cliente confirma que ya recibió el paquete
     */
    public function confirmDelivery(Request $request, $id)
    {
        // Lógica real futura:
        $order = Order::where('id', $id)->where('user_id', Auth::id())->firstOrFail();
         $order->update(['status' => 'Entregado']);

        return redirect()->back()->with('success', '¡Gracias por confirmar tu entrega!');
    }
}