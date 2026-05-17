<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Esta es la migración para los "Me gusta" de las notas
return new class extends Migration
{
    // Aquí defino la tabla que guarda quién le da like a qué nota
    public function up(): void
    {
        Schema::create('likes', function (Blueprint $table) {
            $table->id();
            // El usuario que da el Like
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // La nota que recibe el Like
            $table->foreignId('note_id')->constrained()->cascadeOnDelete();
            $table->timestamps(); // Cuándo se dio el Like
        });
    }

    // Para borrar la tabla si hace falta
    public function down(): void
    {
        Schema::dropIfExists('likes');
    }
};
