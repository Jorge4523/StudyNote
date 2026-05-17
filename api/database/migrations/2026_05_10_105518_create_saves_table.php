<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Esta es la migración para guardar en la "biblioteca" o "favoritos"
return new class extends Migration
{
    // Aquí creo la tabla 'saves' para saber qué usuario se guarda qué nota
    public function up(): void
    {
        Schema::create('saves', function (Blueprint $table) {
            $table->id();
            // El usuario que guarda la nota
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // La nota que ha decidido guardarse
            $table->foreignId('note_id')->constrained()->cascadeOnDelete();
            $table->timestamps(); // Cuándo la guardó
        });
    }

    // Por si queremos deshacer los cambios
    public function down(): void
    {
        Schema::dropIfExists('saves');
    }
};
