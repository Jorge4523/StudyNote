<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Esta es la migración para las notas de estudio, donde se guarda lo que los alumnos publican
return new class extends Migration
{
    // Aquí defino qué lleva cada nota
    public function up(): void
    {
        Schema::create('notes', function (Blueprint $table) {
            $table->id(); // El ID de la nota
            // El ID del usuario que escribió la nota. Si el usuario borra su cuenta, se borran sus notas automáticamente.
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('topic'); // El tema de la nota (ej: Física, Historia...)
            $table->text('content')->nullable(); // El texto de la nota (ahora opcional)
            $table->longText('image')->nullable(); // Una imagen opcional (la guardamos en formato largo de texto)
            $table->longText('file')->nullable(); // Un archivo opcional
            $table->string('file_name')->nullable(); // El nombre del archivo
            $table->timestamps(); // Cuándo se creó y cuándo se editó
        });
    }

    // Para borrar la tabla de notas si hace falta
    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};
