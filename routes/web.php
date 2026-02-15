<?php

use App\Http\Controllers\ProfileController;
use App\Models\Sale;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\BannerController; // <--- Importar BannerController
use App\Http\Controllers\CartController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// --- PÚBLICO ---
Route::get('/', [ProductController::class, 'home'])->name('home'); 
Route::get('/producto/{id}', [ProductController::class, 'show'])->name('product.show');


Route::get('/carrito', [CartController::class, 'index'])->name('cart.index');
Route::post('/carrito/agregar/{id}', [CartController::class, 'add'])->name('cart.add');
Route::patch('/carrito/actualizar', [CartController::class, 'update'])->name('cart.update');
Route::delete('/carrito/remover', [CartController::class, 'remove'])->name('cart.remove');


// --- PRIVADO (Requiere Login) ---
Route::middleware(['auth', 'verified'])->group(function () {
    
    // Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard', [
            'sales' => Sale::where('user_id', auth()->id())->with('client')->latest()->get()
        ]);
    })->name('dashboard');

    // Ventas
    Route::post('/ventas', [SaleController::class, 'store'])->name('sales.store');

    // PRODUCTOS (Vendedor)
    Route::get('/mis-productos', [ProductController::class, 'index'])->name('products.index');
    Route::post('/mis-productos', [ProductController::class, 'store'])->name('products.store');
    Route::post('/mis-productos/{id}', [ProductController::class, 'update'])->name('products.update'); // Update
    Route::delete('/mis-productos/{id}', [ProductController::class, 'destroy'])->name('products.destroy'); // Delete producto
    Route::put('/mis-productos/{id}/status', [ProductController::class, 'toggleStatus'])->name('products.toggle'); // Activar/Cancelar
    Route::delete('/product-image/{id}', [ProductController::class, 'deleteImage'])->name('product.image.delete'); // Delete foto
    Route::get('/products/search', [ProductController::class, 'search'])->name('products.search');
    
    // Reviews
    Route::post('/producto/{id}/review', [ProductController::class, 'storeReview'])->name('product.review.store');

    // --- ADMINISTRACIÓN (Solo ID 1) ---
    // La protección la haremos dentro del BannerController
    Route::get('/configuracion/banners', [BannerController::class, 'index'])->name('admin.banners.index');
    Route::post('/configuracion/banners', [BannerController::class, 'store'])->name('admin.banners.store');
    Route::delete('/configuracion/banners/{id}', [BannerController::class, 'destroy'])->name('admin.banners.destroy');



});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');


    });

require __DIR__.'/auth.php';