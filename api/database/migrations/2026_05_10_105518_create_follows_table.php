<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Esta es la migración para el sistema de seguidores (quién sigue a quién)
return new class extends Migration
{
    // Aquí defino la tabla 'follows'
    public function up(): void
    {
        Schema::create('follows', function (Blueprint $table) {
            $table->id();
            // El usuario que pulsa el botón de "Seguir"
            $table->foreignId('follower_id')->constrained('users')->cascadeOnDelete();
            // El usuario que es seguido por el otro
            $table->foreignId('followed_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            
            // Me aseguro de que no puedas seguir a la misma persona dos veces por error
            $table->unique(['follower_id', 'followed_id']);
        });
    }

    // Para borrar la tabla de seguidores
    public function down(): void
    {
        Schema::dropIfExists('follows');
    }
};
