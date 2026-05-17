<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tablas internas de Laravel para guardar datos en la caché de la base de datos
return new class extends Migration
{
    /**
     * Creación de las tablas de caché
     */
    public function up(): void
    {
        // Tabla principal de caché
        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary(); // El nombre del dato guardado
            $table->mediumText('value'); // El contenido del dato
            $table->bigInteger('expiration')->index(); // Cuándo caduca y se borra
        });

        // Tabla auxiliar para los bloqueos (locks) de la caché para evitar que dos procesos pisen lo mismo
        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('owner');
            $table->bigInteger('expiration')->index();
        });
    }

    /**
     * Para eliminar el sistema de caché por base de datos
     */
    public function down(): void
    {
        Schema::dropIfExists('cache');
        Schema::dropIfExists('cache_locks');
    }
};
