<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory;

  protected $fillable = [
    'user_id',
    'client_id',    // <--- IMPORTANTE
    'product_id',
    'category_id',  // <--- IMPORTANTE
    'concept',
    'amount',
    'is_manual',    // <--- IMPORTANTE
];
    
    // Relación: Vendedor (Usuario del sistema)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relación: Cliente (Comprador)
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    // Relación: Producto (Opcional, puede ser null)
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
    
    // Relación: Categoría
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}