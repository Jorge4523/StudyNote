<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Esta es una tabla interna de Laravel para gestionar los tokens de la API (Sanctum)
return new class extends Migration
{
    /**
     * Crea la tabla donde se guardan las "llaves" de acceso de los usuarios a la API
     */
    public function up(): void
    {
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable'); // A qué modelo pertenece este token (normalmente al User)
            $table->text('name'); // El nombre que le damos al token (ej: 'auth_token')
            $table->string('token', 64)->unique(); // El token secreto en sí, encriptado
            $table->text('abilities')->nullable(); // Los permisos que tiene este token
            $table->timestamp('last_used_at')->nullable(); // Para saber cuándo fue la última vez que el usuario usó la app
            $table->timestamp('expires_at')->nullable()->index(); // Por si queremos que las sesiones caduquen
            $table->timestamps(); // Fecha de creación y actualización del token
        });
    }

    /**
     * Si borramos esto, todos perderán el acceso a la API
     */
    public function down(): void
    {
        Schema::dropIfExists('personal_access_tokens');
    }
};
