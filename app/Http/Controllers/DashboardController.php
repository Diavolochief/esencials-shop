<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Review; 
use App\Models\Sale;
use Inertia\Inertia;

class ProductController extends Controller
{
    // Catálogo público
    public function index()
{
    $sales = Sale::where('user_id', auth()->id())
                ->latest()
                ->take(10)
                ->get();

    return Inertia::render('Dashboard', [
        'sales' => $sales
    ]);

    

    }

    // Vista de un solo producto
    public function show($id)
    {
        return Inertia::render('Product/Show', [
            'product' => Product::with('category')
                ->available()
                ->findOrFail($id)
        ]);
    }
}
