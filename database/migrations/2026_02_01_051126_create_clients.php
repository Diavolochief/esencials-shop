<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            
            // 1. EL VENDEDOR: ¿A quién pertenece este cliente? (Tú, el usuario logueado)
            $table->foreignId('seller_id')->constrained('users')->onDelete('cascade');

            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->text('notes')->nullable(); // Preferencias, tallas, etc.

            // 3. EL VÍNCULO MÁGICO: Si este cliente YA es usuario de la app
            // Esto permite que el cliente sea usuario y vendedor a la vez
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');

            $table->timestamps();
            
            // Evitar duplicar el mismo email para el mismo vendedor
            $table->unique(['seller_id', 'email']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};