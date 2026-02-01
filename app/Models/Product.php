<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'category_id', 'name', 'description', 
        'price', 'condition', 'image_url', 'is_sold',
        'stock','is_active',
    ];

    // Relaciones
    public function user() { return $this->belongsTo(User::class); }
    public function category() { return $this->belongsTo(Category::class); }
    
    // Scope para mostrar solo lo que no se ha vendido
    public function scopeAvailable($query) {
        return $query->where('is_sold', false);
    }

    public function images()
{
    return $this->hasMany(ProductImage::class);
}
public function reviews() { return $this->hasMany(Review::class); }


}