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
        Schema::create('products', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade'); // El Vendedor
        $table->foreignId('category_id')->constrained(); // Categoría (solo id y nombre)
        $table->string('name');
        $table->text('description');
        $table->decimal('price', 10, 2);
        // Estado físico del producto
        $table->enum('condition', ['nuevo', 'bueno', 'usado', 'detalles']); 
        $table->string('image_url'); // Foto principal
        // Control para que no aparezca si ya se vendió
        $table->boolean('is_sold')->default(false); 
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
                Schema::dropIfExists('products');

    }
};
