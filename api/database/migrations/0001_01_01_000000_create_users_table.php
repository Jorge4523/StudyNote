<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Esta es la migración para crear la tabla de usuarios, es como el plano de nuestra base de datos para las personas
return new class extends Migration
{
    /**
     * Aquí defino qué datos vamos a guardar de cada usuario
     */
    public function up(): void
    {
        // Creo la tabla 'users'
        Schema::create('users', function (Blueprint $table) {
            $table->id(); // Un número único para cada usuario
            $table->string('name'); // Su nombre real
            $table->string('username')->unique(); // Su nombre de usuario (el @algo), que no se puede repetir
            $table->string('email')->unique(); // Su correo electrónico, también único
            $table->string('pending_email')->nullable(); // Por si quiere cambiar de correo, guardo aquí el nuevo mientras confirma
            $table->timestamp('email_verified_at')->nullable(); // Cuándo confirmó su correo
            $table->string('password'); // Su contraseña (guardada de forma segura)
            $table->string('avatar')->nullable(); // La foto de perfil
            $table->text('bio')->nullable(); // Su pequeña descripción o biografía
            $table->string('website')->nullable(); // Su página web si tiene
            $table->string('location')->nullable(); // De dónde es
            $table->string('education_center')->nullable(); // Dónde estudia
            $table->json('skills')->nullable(); // Sus habilidades (lo guardo como una lista)
            $table->boolean('is_private')->default(false); // Si su cuenta es privada o pública
            $table->json('notification_settings')->nullable(); // Sus ajustes de avisos
            $table->string('verification_code', 6)->nullable(); // El código de 6 números para seguridad
            $table->rememberToken(); // Para que la sesión no se cierre sola
            $table->timestamps(); // Guarda automáticamente cuándo se creó y cuándo se actualizó el usuario
        });

        // Tabla interna de Laravel para cuando alguien olvida la contraseña
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // Tabla interna de Laravel para manejar las sesiones de los usuarios
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Esta función sirve por si queremos borrar las tablas y empezar de cero
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
