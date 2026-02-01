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
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            // El usuario (vendedor) que registró la venta
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Opcional: Si la venta viene de un producto registrado en la tabla 'products'
            // Lo dejamos nullable porque tu formulario actual es manual (solo concepto)
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('set null');
            
            // Descripción de lo vendido (ej: "Paquete de camisas" o el nombre del producto)
            $table->string('concept');
            
            // El precio final al que se vendió
            $table->decimal('amount', 10, 2);
            
            $table->timestamps();
            });
    }
    

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
