<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tablas internas de Laravel para manejar las "colas de trabajo" (ej: envío de correos en segundo plano)
return new class extends Migration
{
    /**
     * Prepara la base de datos para ejecutar tareas lentas sin colgar la web
     */
    public function up(): void
    {
        // Aquí se guardan los trabajos pendientes (como mandar el email de verificación)
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->string('queue')->index(); // El nombre de la cola
            $table->longText('payload'); // Los datos del trabajo a realizar
            $table->unsignedSmallInteger('attempts'); // Cuántas veces ha intentado ejecutarse
            $table->unsignedInteger('reserved_at')->nullable(); // Si ya lo está haciendo algún proceso
            $table->unsignedInteger('available_at'); // Cuándo se puede empezar
            $table->unsignedInteger('created_at'); // Cuándo se pidió el trabajo
        });

        // Para agrupar muchos trabajos de golpe (Lotes/Batches)
        Schema::create('job_batches', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->integer('total_jobs');
            $table->integer('pending_jobs');
            $table->integer('failed_jobs');
            $table->longText('failed_job_ids');
            $table->mediumText('options')->nullable();
            $table->integer('cancelled_at')->nullable();
            $table->integer('created_at');
            $table->integer('finished_at')->nullable();
        });

        // Por si un trabajo da error (ej: el servidor de correos está caído), se guarda aquí para revisarlo
        Schema::create('failed_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->text('connection');
            $table->text('queue');
            $table->longText('payload'); // Qué se intentaba hacer
            $table->longText('exception'); // El error que dio
            $table->timestamp('failed_at')->useCurrent(); // Cuándo falló
        });
    }

    /**
     * Para borrar todo el sistema de colas
     */
    public function down(): void
    {
        Schema::dropIfExists('jobs');
        Schema::dropIfExists('job_batches');
        Schema::dropIfExists('failed_jobs');
    }
};
