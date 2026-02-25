<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Review;
use App\Models\Banner;
use App\Models\Category; // <--- IMPRESCINDIBLE
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class ProductController extends Controller
{
    // ==========================================
    // 1. SECCIÓN PÚBLICA (CLIENTES)
    // ==========================================

    /**
     * Página de Inicio (Landing Page)
     */
   public function home(Request $request) // <-- Añade (Request $request)
    {
        $maxSales = Product::max('sold_count');
        
        $banners = Banner::where('is_active', true)
            ->orderBy('order', 'asc')
            ->get();

        // PRODUCTOS PARA EL CARRUSEL (Top 6)
        $topProducts = Product::where('is_active', true)
            ->where('stock', '>', 0)
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->with('category')
            ->orderBy('sold_count', 'desc')
            ->take(6) // <-- Usamos take(6) en lugar de paginate() para el carrusel
            ->get();

        // ==========================================
        // NUEVA PARTE: PRODUCTOS PARA LA CUADRÍCULA
        // ==========================================
        $categoryId = $request->input('category_id'); // Recibimos la tab clickeada
        $search = $request->input('search'); // Recibimos el texto del buscador

        $catalogueProducts = Product::where('is_active', true)
            ->with('category')
            ->when($categoryId && $categoryId !== 'all', function ($q) use ($categoryId) {
                // Filtramos por categoría SI seleccionaron una (y no es 'all')
                return $q->where('category_id', $categoryId);
            })
            ->when($search, function($q) use ($search){
                 return $q->where('name', 'LIKE', "%{$search}%");
            })
            ->orderBy('created_at', 'desc') // Los más nuevos primero
            ->take(12) // Mostrar hasta 12 en el inicio (puedes usar paginate si prefieres)
            ->get();
            
        // Mandamos las categorías para que las Tabs funcionen
        $categories = Category::all(['id', 'name']);

        return Inertia::render('Home', [
            'topProducts' => $topProducts,
            'catalogueProducts' => $catalogueProducts,
            'banners' => $banners,
            'bestSellerCount' => $maxSales,
            'categories' => $categories,
            // Mandamos de vuelta los filtros para que React sepa cuál tab está activa
            'filters' => ['category_id' => $categoryId ?? 'all', 'search' => $search ?? ''] 
        ]);
    }
    

    /**
     * Catálogo Visual (Vista: Products.jsx)
     * Accesible para cualquier visitante.
     */
    public function catalogue(Request $request)
    {
        $search = $request->input('search');
        $categoryId = $request->input('category_id');

        // Obtenemos categorías para los botones de filtro (Chips)
        $categories = Category::all(['id', 'name']);

        $products = Product::query()
            ->where('is_active', true) // Solo mostrar productos activos al público
            
            // Filtro de Búsqueda (Nombre, Descripción o Nombre de Categoría)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhereHas('category', function ($catQuery) use ($search) {
                          $catQuery->where('name', 'like', "%{$search}%");
                      });
                });
            })
            
            // Filtro de Categoría (Click en Chip)
            ->when($categoryId, function ($query, $id) {
                $query->where('category_id', $id);
            })
            
            ->with('category')
            ->orderBy('created_at', 'desc')
            ->paginate(12)
            ->withQueryString(); // Mantiene los filtros al cambiar de página

        return Inertia::render('Products', [
            'products' => $products,
            'categories' => $categories, // Enviamos las categorías al frontend
            'filters' => $request->only(['search', 'category_id']),
        ]);
    }

    /**
     * Detalle de Producto Individual
     */
    public function show($id)
    {
        $product = Product::with(['reviews.user', 'images', 'category'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->findOrFail($id);

        return Inertia::render('Product/Show', [
            'product' => $product,
            'canReview' => Auth::check()
        ]);
    }

    /**
     * API para el Buscador del Navbar (Autocompletado)
     */
    public function search(Request $request)
    {
        $query = $request->get('query');
        
        $products = Product::where('is_active', true)
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

    /**
     * Guardar una Reseña/Comentario
     */
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
    // 2. SECCIÓN PRIVADA (ADMINISTRACIÓN / VENDEDOR)
    // ==========================================

    /**
     * Panel "Mis Productos" (Vista: MyProducts.jsx)
     * Tabla de gestión + Modal de creación.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $categories = Category::all(['id', 'name']);

        $products = Product::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            })
            // 👇 ¡AQUÍ ESTÁ EL TRUCO! Agrega 'images' al with()
            ->with(['category', 'images']) 
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('MyProducts', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search']),
        ]);
    }
    /**
     * Guardar Nuevo Producto
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:1',
            'category_id' => 'required|exists:categories,id', // Validamos que la categoría exista
            'condition' => 'required|string',
            'description' => 'nullable|string',
            'image' => 'required|nullable|image|max:2048',
            'gallery.*' => 'nullable|image|max:2048',
        ]);

        // Procesar Foto Principal
        $mainImageUrl = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $mainImageUrl = asset('storage/' . $path);
        }

        // Crear Producto en DB
        $product = Product::create([
            'user_id' => Auth::id(),
            'category_id' => $request->category_id,
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

        // Procesar Galería (Opcional)
        if ($request->hasFile('gallery')) {
            foreach ($request->file('gallery') as $photo) {
                $path = $photo->store('products/gallery', 'public');
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_url' => asset('storage/' . $path),
                ]);
            }
        }

        return Redirect::back()->with('success', 'Producto creado exitosamente.');
    }

    /**
     * Actualizar Producto Existente
     */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        
        // Seguridad: Verificar que el producto pertenece al usuario actual
        if ($product->user_id !== Auth::id()) abort(403);

        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'exists:categories,id',
            'condition' => 'required|string',
            'image' => 'nullable|image|max:2048',
            'gallery.*' => 'nullable|image|max:2048',
        ]);

        $data = $request->only(['name', 'price', 'stock', 'condition', 'description', 'category_id']);

        // Si sube nueva imagen, borramos la anterior y guardamos la nueva
        if ($request->hasFile('image')) {
            if ($product->image_url) {
                // Convertir URL completa a ruta relativa para borrar
                $oldPath = str_replace(asset('storage/'), '', $product->image_url);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('products', 'public');
            $data['image_url'] = asset('storage/' . $path);
        }

        $product->update($data);

        // Agregar más imágenes a la galería
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

    /**
     * Eliminar Producto
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        if ($product->user_id !== Auth::id()) abort(403);
        
        // (Opcional) Podrías agregar lógica aquí para borrar también la imagen del storage
        
        $product->delete();
        return Redirect::back()->with('error', 'El producto ha sido eliminado permanentemente.');
    }

    /**
     * Activar / Desactivar Producto (Toggle)
     */
    public function toggleStatus($id)
    {
        $product = Product::findOrFail($id);
        if ($product->user_id !== Auth::id()) abort(403);

        $product->update(['is_active' => !$product->is_active]);
        
        return Redirect::back()->with('warning', 'Estado del producto actualizado.');
    }

    /**
     * Eliminar una imagen específica de la galería
     */
    public function deleteImage($id)
    {
        $image = ProductImage::findOrFail($id);
        if ($image->product->user_id !== Auth::id()) abort(403);

        $path = str_replace(asset('storage/'), '', $image->image_url);
        Storage::disk('public')->delete($path);
        $image->delete();

        return Redirect::back()->with('error', 'Imagen eliminada de la galería.');
    }
}