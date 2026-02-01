<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = ['user_id', 'total', 'status', 'shipping_address'];

    public function items() { return $this->hasMany(OrderItem::class); }
    public function user() { return $this->belongsTo(User::class); } // Comprador
    public function shipment() { return $this->hasOne(Shipment::class); }
    public function payment() { return $this->hasOne(Payment::class); }
}