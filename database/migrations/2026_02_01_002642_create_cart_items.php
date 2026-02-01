<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
        {Schema::create('cart_items', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Dueño del carrito
        $table->foreignId('product_id')->constrained()->onDelete('cascade'); // Producto a comprar
        $table->timestamps();
        
        // Opcional: Evitar que el usuario agregue el mismo producto único dos veces
        $table->unique(['user_id', 'product_id']); 
    });
    }

    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};
