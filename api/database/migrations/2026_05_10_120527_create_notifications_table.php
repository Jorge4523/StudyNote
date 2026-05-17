<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Esta es la migración para los avisos o notificaciones que le salen al usuario
return new class extends Migration
{
    /**
     * Aquí defino qué guardamos de cada aviso
     */
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            // El usuario que recibe el aviso
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            // El usuario que ha hecho la acción (el que dio like, el que siguió, etc.)
            $table->foreignId('actor_id')->constrained('users')->onDelete('cascade');
            // El tipo de aviso: puede ser 'like', 'follow' o 'reply'
            $table->string('type'); 
            // Datos extra que necesitemos guardar, como el ID de la nota
            $table->json('data')->nullable(); 
            // Para saber si el usuario ya ha pinchado en la campanita y lo ha visto
            $table->boolean('is_read')->default(false);
            $table->timestamps(); // Cuándo ocurrió la acción
        });
    }

    /**
     * Para borrar la tabla de notificaciones
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
