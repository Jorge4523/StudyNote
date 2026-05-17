<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Migración para los votos positivos o negativos en las respuestas
return new class extends Migration
{
    // Tabla 'votes' para el sistema de ranking de respuestas
    public function up(): void
    {
        Schema::create('votes', function (Blueprint $table) {
            $table->id();
            // Quién vota
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // A qué respuesta está votando
            $table->foreignId('reply_id')->constrained()->cascadeOnDelete();
            // Si el voto es positivo (up) o negativo (down)
            $table->enum('type', ['up', 'down']);
            $table->timestamps(); // Cuándo votó
            
            // Me aseguro de que un usuario solo pueda votar una vez por respuesta
            $table->unique(['user_id', 'reply_id']);
        });
    }

    // Para borrar la tabla de votos si hace falta
    public function down(): void
    {
        Schema::dropIfExists('votes');
    }
};
