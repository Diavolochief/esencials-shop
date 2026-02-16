<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Review;
use App\Models\Banner; 
use App\Models\Category; // <--- IMPORTANTE: Modelo Category Importado
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class ProductController extends Controller
{
    // ==========================================
    // PARTE PÚBLICA (Home, Catálogo y Detalle)
    // ==========================================

    public function home()
    {
        // 1. Máximo de ventas para etiqueta "Más Vendido"
        $maxSales = Product::max('sold_count');

        // 2. Banners del Carrusel
        $banners = Banner::where('is_active', true)->orderBy('order', 'asc')->get();

        // 3. Productos Destacados para el Home (Limitado a 3)
        $products = Product::where('is_active', true)
            ->where('stock', '>', 0)
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->orderBy('sold_count', 'desc') 
            ->paginate(3); 

        return Inertia::render('Home', [
            'products' => $products,
            'banners' => $banners,
            'bestSellerCount' => $maxSales
        ]);
    }

    // --- MÉTODO DEL CATÁLOGO PÚBLICO (BÚSQUEDA Y FILTROS) ---
    public function catalogue(Request $request)
    {
        $search = $request->input('search');
        $categoryId = $request->input('category_id'); // <--- Recibimos el ID de categoría

        // 1. Obtener TODAS las categorías para mostrar los botones de filtro
        $categories = Category::all(['id', 'name']);

        // 2. Query de Productos con Filtros
        $products = Product::query()
            ->where('is_active', true) // Solo activos
            
            // Filtro A: Búsqueda por Texto (Nombre, Descripción o Categoría)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhereHas('category', function ($catQuery) use ($search) {
                          $catQuery->where('name', 'like', "%{$search}%");
                      });
                });
            })
            
            // Filtro B: Botón de Categoría Específica
            ->when($categoryId, function ($query, $id) {
                $query->where('category_id', $id);
            })
            
            ->with('category') // Cargar relación para mostrar nombre en tarjeta
            ->orderBy('created_at', 'desc')
            ->paginate(12)
            ->withQueryString(); // Mantener filtros al cambiar de página

        return Inertia::render('Products', [
            'products' => $products,
            'categories' => $categories, // <--- Enviamos categorías a la vista
            'filters' => $request->only(['search', 'category_id']),
        ]);
    }

    public function show($id)
    {
        $product = Product::with(['reviews.user', 'images', 'category']) // Cargamos categoría también
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
    // PARTE PRIVADA (Panel de Vendedor / Admin)
    // ==========================================

    public function index(Request $request)
    {
        $search = $request->input('search');

        // 1. RECUPERAR CATEGORÍAS (Esto faltaba y causaba el error)
        $categories = Category::all(['id', 'name']); 

        $products = Product::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->with('category')
            ->orderBy('created_at', 'desc') // Ordenar para ver los nuevos
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Products', [
            'products' => $products,
            'categories' => $categories, // <--- ¡AQUÍ ESTÁ LA SOLUCIÓN!
            'filters' => $request->only(['search']),
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
            'category_id' => 'required|exists:categories,id', // Validar que la categoría exista
            'image' => 'required|nullable|image|max:2048',
            'gallery.*' => 'nullable|image|max:2048',
        ]);

        // Foto Principal
        $mainImageUrl = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $mainImageUrl = asset('storage/' . $path);
        }

        // Crear Producto
        $product = Product::create([
            'user_id' => Auth::id(),
            'category_id' => $request->category_id, // Usar la categoría del formulario
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
            'category_id' => 'exists:categories,id',
            'image' => 'nullable|image|max:2048',
            'gallery.*' => 'nullable|image|max:2048',
        ]);

        $data = $request->only(['name', 'price', 'stock', 'condition', 'description', 'category_id']);

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

        return Redirect::back()->with('error', 'La imagen ha sido eliminada.');    
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        if ($product->user_id !== Auth::id()) abort(403);
        $product->delete();
        return Redirect::back()->with('error', 'El producto ha sido eliminado permanentemente.');    
    }

    // ==========================================
    // AUTOCOMPLETADO (AJAX)
    // ==========================================
    public function search(Request $request){
        $query = $request->get('query');
        
        $products = Product::where('is_active', true) // Solo buscar en activos
                        ->where(function($q) use ($query) {
                            $q->where('name', 'LIKE', "%{$query}%")
                              ->orWhere('description', 'LIKE', "%{$query}%")
                              ->orWhereHas('category', function($cat) use ($query){
                                  $cat->where('name', 'LIKE', "%{$query}%");
                              });
                        })
                        ->limit(8)
                        ->get(['id', 'name', 'price', 'image_url']); 

        return response()->json($products);
    }
}