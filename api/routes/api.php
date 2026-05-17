<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\ReplyController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\SaveController;
use App\Http\Controllers\VoteController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\NotificationController;


// --- RUTAS PARA ENTRAR Y REGISTRARSE ---
// Para iniciar sesión, confirmar el código de seguridad o crear una cuenta nueva
Route::post('/login', [AuthController::class, 'login']);
Route::post('/verify-code', [AuthController::class, 'verifyCode']);
Route::post('/register', [AuthController::class, 'register']);

// --- RUTAS PROTEGIDAS (Requieren estar logueado con Token) ---
Route::middleware('auth:sanctum')->group(function () {
    // Notas y respuestas
    Route::get('/notes', [NoteController::class, 'index']);
    Route::post('/notes/create', [NoteController::class, 'store']);
    Route::delete('/notes/{id}', [NoteController::class, 'destroy']);
    Route::post('/replies', [ReplyController::class, 'store']);
    Route::post('/likes', [LikeController::class, 'toggle']);
    Route::post('/saves', [SaveController::class, 'toggle']);
    Route::post('/votes', [VoteController::class, 'toggle']);

    // Perfil y Usuarios
    Route::post('/follow', [FollowController::class, 'toggle']);
    Route::get('/search', [SearchController::class, 'index']);
    Route::get('/ranking', [UserController::class, 'ranking']);
    Route::get('/users/{username}', [UserController::class, 'show']);
    Route::post('/user/update', [UserController::class, 'update']);
    Route::post('/user/verify-email-change', [UserController::class, 'verifyEmailChange']);
    Route::post('/user/change-password', [UserController::class, 'changePassword']);
    Route::post('/user/delete', [UserController::class, 'destroy']);

    // Notificaciones
    Route::get('/notifications/{userId}', [NotificationController::class, 'index']);
    Route::post('/notifications/read/{userId}', [NotificationController::class, 'markAsRead']);
});
