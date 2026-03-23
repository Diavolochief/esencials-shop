<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\UserAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    public function index()
    {
        $addresses = UserAddress::where('user_id', Auth::id())->get();
        $cart = session()->get('cart', []);

        return Inertia::render('Checkout', [
            'addresses' => $addresses,
            'cart' => $cart
        ]);
    }

    public function process(Request $request)
    {
        $request->validate([
            'address' => 'required|string',
            'items' => 'required|array|min:1', 
        ]);

        DB::beginTransaction();

        try {
            // 1. Creamos la orden primero con valores en 0 para obtener el ID
            $order = Order::create([
                'user_id' => Auth::id(),
                'total' => 0,
                'total_profit' => 0,
                'status' => 'Pendiente',
                'shipping_address' => $request->address,
            ]);

            $totalAmount = 0;
            $totalProfit = 0;

            // 2. Procesamos los productos en UN SOLO ciclo
            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['id']);

                // Validar Stock
                if ($product->stock < $item['quantity']) {
                    throw new \Exception("No hay stock suficiente para {$product->name}");
                }

                // Cálculos financieros
                $subtotal = $product->price * $item['quantity'];
                // Ganancia = (Venta - Costo) * Cantidad
                $profit = ($product->price - $product->cost_price) * $item['quantity'];

                $totalAmount += $subtotal;
                $totalProfit += $profit;

                // Crear el detalle de la orden
                $order->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $product->price,
                ]);

                // Descontar Stock
                $product->decrement('stock', $item['quantity']);
            }

            // 3. Actualizamos la orden con los totales finales calculados
            $order->update([
                'total' => $totalAmount,
                'total_profit' => $totalProfit
            ]);

            // 4. (Opcional) Guardar nueva dirección si es necesario
            if ($request->save_address && isset($request->new_address)) {
                UserAddress::create([
                    'user_id' => Auth::id(),
                    'street' => $request->new_address['street'],
                    'city' => $request->new_address['city'],
                    'state' => $request->new_address['state'],
                    'zip_code' => $request->new_address['zip_code'],
                    'phone' => $request->new_address['phone'],
                ]);
            }

            DB::commit();
            session()->forget('cart');

            return redirect()->route('mis_compras.index')->with('success', '¡Pedido realizado con éxito!');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}