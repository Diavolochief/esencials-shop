<?php

use App\Http\Controllers\ProfileController;
use App\Models\Sale;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\CartController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| RUTAS PÚBLICAS (Accesibles sin iniciar sesión)
|--------------------------------------------------------------------------
*/

// Home Page
Route::get('/', [ProductController::class, 'home'])->name('home');

// Catálogo Visual (Vista bonita con filtros para clientes)
Route::get('/productos', [ProductController::class, 'catalogue'])->name('catalogo.index');

// Detalle de Producto
Route::get('/producto/{id}', [ProductController::class, 'show'])->name('product.show');

// API para el Buscador Global (Autocompletado)
Route::get('/products/search', [ProductController::class, 'search'])->name('products.search');

// Carrito de Compras
Route::get('/carrito', [CartController::class, 'index'])->name('cart.index');
Route::post('/carrito/agregar/{id}', [CartController::class, 'add'])->name('cart.add');
Route::patch('/carrito/actualizar', [CartController::class, 'update'])->name('cart.update');
Route::delete('/carrito/remover', [CartController::class, 'remove'])->name('cart.remove');

/*
|--------------------------------------------------------------------------
| RUTAS PRIVADAS (Requieren Login y Verificación)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {

    // --- DASHBOARD ---
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard', [
            'sales' => Sale::where('user_id', auth()->id())->with('client')->latest()->get()
        ]);
    })->name('dashboard');

    // --- PERFIL DE USUARIO ---
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // --- VENTAS (Registrar venta manual) ---
    Route::post('/ventas', [SaleController::class, 'store'])->name('sales.store');

    // --- GESTIÓN DE MIS PRODUCTOS (Panel Vendedor: Tabla, Crear, Editar, Borrar) ---
    Route::get('/mis-productos', [ProductController::class, 'index'])->name('products.index'); // Ver tabla
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');     // Guardar nuevo
    Route::post('/products/{id}', [ProductController::class, 'update'])->name('products.update'); // Actualizar (POST para soportar archivos)
    Route::delete('/products/{id}', [ProductController::class, 'destroy'])->name('products.destroy'); // Eliminar
    
// Acciones extra en productos
    // OJO: Le cambiamos el nombre para que coincida con React (products.toggleStatus)
    Route::post('/products/{id}/status', [ProductController::class, 'toggleStatus'])->name('products.toggleStatus'); 
    
    // OJO: Le cambiamos el nombre para que coincida con React (products.deleteImage)
    Route::delete('/product-image/{id}', [ProductController::class, 'deleteImage'])->name('products.deleteImage');
    // --- REVIEWS (Solo usuarios logueados pueden comentar) ---
    Route::post('/producto/{id}/review', [ProductController::class, 'storeReview'])->name('product.review.store');

    // --- ADMINISTRACIÓN (Configuración del Sitio) ---
    Route::get('/configuracion/banners', [BannerController::class, 'index'])->name('admin.banners.index');
    Route::post('/configuracion/banners', [BannerController::class, 'store'])->name('admin.banners.store');
    Route::delete('/configuracion/banners/{id}', [BannerController::class, 'destroy'])->name('admin.banners.destroy');
});

require __DIR__ . '/auth.php';