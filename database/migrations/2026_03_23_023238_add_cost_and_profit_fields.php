<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up()
{
    // Agregar costo al producto
    Schema::table('products', function (Blueprint $table) {
        $table->decimal('cost_price', 12, 2)->after('price')->default(0);
    });

    // Agregar ganancia a la orden para que "Mis Ventas" pueda leerlo rápido
    Schema::table('orders', function (Blueprint $table) {
        $table->decimal('total_profit', 12, 2)->after('total')->default(0);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
