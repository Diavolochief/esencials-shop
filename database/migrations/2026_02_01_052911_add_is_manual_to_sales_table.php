<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   
    public function up(): void
{
    Schema::table('sales', function (Blueprint $table) {
        // Por defecto es FALSE (o sea, venta automática/web).
        // Solo será TRUE cuando la mandemos desde el Dashboard.
        $table->boolean('is_manual')->default(false)->after('amount');
    });
}

public function down(): void
{
    Schema::table('sales', function (Blueprint $table) {
        $table->dropColumn('is_manual');
    });
}
};
