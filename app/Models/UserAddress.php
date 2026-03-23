<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserAddress extends Model
{
    use HasFactory;

    // Los campos que permitimos guardar masivamente
    protected $fillable = [
        'user_id',
        'street',
        'city',
        'state',
        'zip_code',
        'phone',
        'is_default',
    ];

    /**
     * Relación: Una dirección pertenece a un usuario
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}