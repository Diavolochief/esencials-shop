<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Review;
use App\Models\Banner; // <--- Importante para el carrusel
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class ProductController extends Controller
{
    // ==========================================
    // PARTE PÚBLICA (Catálogo y Detalle)
    // ==========================================

    public function home()
    {
        // 1. Calcular cuál es el máximo de ventas global (para la etiqueta "Más Vendido")
        $maxSales = Product::max('sold_count');

        // 2. Obtener Banners Activos para el Carrusel
        $banners = Banner::where('is_active', true)
            ->orderBy('order', 'asc')
            ->get();

        // 3. Obtener Productos
        // - Solo activos y con stock
        // - Con promedio de estrellas y conteo de reviews
        // - Ordenados por ventas (opcional, o podrías usar latest())
        // - Paginación de 3 (Layout 3x1)
        $products = Product::where('is_active', true)
            ->where('stock', '>', 0)
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->orderBy('sold_count', 'desc') // Los más vendidos primero
            ->paginate(3); 

        return Inertia::render('Home', [
            'products' => $products,
            'banners' => $banners,
            'bestSellerCount' => $maxSales // Pasamos el número récord de ventas
        ]);
    }

    public function show($id)
    {
        $product = Product::with(['reviews.user', 'images'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->findOrFail($id);

        return Inertia::render('Product/Show', [
            'product' => $product,
            'canReview' => Auth::check()
        ]);
    }

    public function storeReview(Request $request, $id)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:500',
        ]);

        Review::create([
            'user_id' => Auth::id(),
            'product_id' => $id,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        return Redirect::back()->with('success', '¡Gracias por tu opinión!');
    }

    // ==========================================
    // PARTE PRIVADA (Panel de Vendedor)
    // ==========================================

    public function index()
    {
        $products = Product::with('images')
            ->where('user_id', Auth::id())
            ->latest()
            ->get();

        return Inertia::render('Product/Index', [
            'products' => $products
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:1',
            'condition' => 'required|string',
            'description' => 'nullable|string',
            'image' => 'required|nullable|image|max:2048',


            'gallery.*' => 'nullable|image|max:2048',
        ]);

        // Foto Principal
        $mainImageUrl = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $mainImageUrl = asset('storage/' . $path);
        }

        // Crear Producto (sold_count inicia en 0)
        $product = Product::create([
            'user_id' => Auth::id(),
            'category_id' => 1, // Ajustar según tu lógica de categorías
            'name' => $request->name,
            'description' => $request->description ?? '',
            'price' => $request->price,
            'stock' => $request->stock,
            'sold_count' => 0, 
            'condition' => $request->condition,
            'image_url' => $mainImageUrl,
            'is_sold' => false,
            'is_active' => true
        ]);

        // Galería
        if ($request->hasFile('gallery')) {
            foreach ($request->file('gallery') as $photo) {
                $path = $photo->store('products/gallery', 'public');
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_url' => asset('storage/' . $path),
                ]);
            }
        }

return Redirect::back()->with('success', '¡Producto agregado al inventario!');    
}

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        if ($product->user_id !== Auth::id()) abort(403);

        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'condition' => 'required|string',
            'image' => 'nullable|image|max:2048',
            'gallery.*' => 'nullable|image|max:2048',
        ]);

        $data = $request->only(['name', 'price', 'stock', 'condition', 'description']);

        // Actualizar Foto Principal
        if ($request->hasFile('image')) {
            if ($product->image_url) {
                $oldPath = str_replace(asset('storage/'), '', $product->image_url);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('products', 'public');
            $data['image_url'] = asset('storage/' . $path);
        }

        $product->update($data);

        // Agregar a Galería
        if ($request->hasFile('gallery')) {
            foreach ($request->file('gallery') as $photo) {
                $path = $photo->store('products/gallery', 'public');
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_url' => asset('storage/' . $path),
                ]);
            }
        }

return Redirect::back()->with('warning', 'Producto actualizado correctamente.');
    }

    public function toggleStatus($id)
    {
        $product = Product::findOrFail($id);
        if ($product->user_id !== Auth::id()) abort(403);

        $product->update(['is_active' => !$product->is_active]);
        
return Redirect::back()->with('warning', 'Producto activado correctamente.');
    }

    public function deleteImage($id)
    {
        $image = ProductImage::findOrFail($id);
        if ($image->product->user_id !== Auth::id()) abort(403);

        $path = str_replace(asset('storage/'), '', $image->image_url);
        Storage::disk('public')->delete($path);
        $image->delete();

return Redirect::back()->with('error', 'la imagen ha sido eliminada.');    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        if ($product->user_id !== Auth::id()) abort(403);
        $product->delete();
return Redirect::back()->with('error', 'El producto ha sido eliminado permanentemente.');    }
}