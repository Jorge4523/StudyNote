<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Esta es la migración para las respuestas de las notas
return new class extends Migration
{
    // Aquí defino qué lleva cada respuesta
    public function up(): void
    {
        Schema::create('replies', function (Blueprint $table) {
            $table->id(); // ID de la respuesta
            // Quién escribe la respuesta. Si se borra el usuario, se borra su respuesta.
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // A qué nota pertenece esta respuesta. Si se borra la nota, se borran sus respuestas.
            $table->foreignId('note_id')->constrained()->cascadeOnDelete();
            $table->text('content'); // El texto de la respuesta
            $table->timestamps(); // Cuándo se escribió
        });
    }

    // Para borrar la tabla si hace falta
    public function down(): void
    {
        Schema::dropIfExists('replies');
    }
};
