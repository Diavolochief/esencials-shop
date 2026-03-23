<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OrderController extends Controller
{
    // ==========================================
    // 1. CLIENTE: MIS COMPRAS
    // ==========================================

    /**
     * Vista "Mis Compras" para el Cliente
     */
    public function myPurchases(Request $request)
    {
        // 1. Traemos las órdenes del usuario logueado
        // 2. Usamos "with('items.product')" para traer también la info y foto de cada producto
        $orders = Order::with('items.product')
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('MisCompras', [
            'orders' => $orders
        ]);
    }

    /**
     * El Cliente confirma que ya recibió el paquete (Cambia a Entregado)
     */
    public function confirmDelivery(Request $request, $id)
    {
        $order = Order::where('id', $id)->where('user_id', Auth::id())->firstOrFail();
        $order->update(['status' => 'Entregado']);

        return redirect()->back()->with('success', '¡Gracias por confirmar tu entrega!');
    }


    // ==========================================
    // 2. ADMINISTRADOR: MIS VENTAS
    // ==========================================

    /**
     * Vista "Mis Ventas" para el Admin (Ve todos los pedidos del sistema)
     */
    public function allSales(Request $request)
    {
        // Traemos TODAS las órdenes del sistema con sus productos y el usuario que compró
        $sales = Order::with(['user', 'items.product'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('MisVentas', [
            'allOrders' => $sales
        ]);
    }

    /**
     * El Admin guarda la guía de paquetería (Cambia a Enviado)
     */
    public function updateShipment(Request $request, $id)
    {
        $request->validate([
            'courier' => 'required|string',
            'tracking_number' => 'required|string',
            'tracking_url' => 'nullable|url',
        ]);

        $order = Order::findOrFail($id);
        
        $order->update([
            'courier' => $request->courier,
            'tracking_number' => $request->tracking_number,
            'tracking_url' => $request->tracking_url,
            'status' => 'Enviado' // Avanza el stepper del cliente
        ]);

        return redirect()->back()->with('success', 'Envío actualizado correctamente. El cliente ha sido notificado.');
    }
}