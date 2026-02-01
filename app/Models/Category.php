<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = ['name']; // Solo nombre, el ID es automático
    public function products() { return $this->hasMany(Product::class); }
}
