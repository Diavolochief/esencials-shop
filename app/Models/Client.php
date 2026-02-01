<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'seller_id',
        'name',
        'email',
        'phone',
        'address',
        'notes',
        'user_id', 
    ];

    // Relación: El Vendedor (Dueño de este registro)
    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    // Relación: La cuenta de usuario real (si el cliente está registrado)
    public function systemUser()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    
    // Relación: Las compras que ha hecho este cliente
    public function sales()
    {
        return $this->hasMany(Sale::class);
    }
}