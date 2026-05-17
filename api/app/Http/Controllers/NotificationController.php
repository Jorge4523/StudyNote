<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;

// Este controlador se encarga de avisar al usuario cuando pasan cosas (le dan like, le siguen, etc.)
class NotificationController extends Controller
{
    // Esta función saca las últimas 20 notificaciones que ha recibido el usuario
    public function index($userId)
    {
        return Notification::where('user_id', $userId)
            ->with('actor') // Quién ha hecho la acción
            ->orderBy('created_at', 'desc') // Las más nuevas arriba del todo
            ->take(20)
            ->get();
    }

    // Esta función sirve para marcar que el usuario ya ha visto sus notificaciones
    public function markAsRead($userId)
    {
        Notification::where('user_id', $userId)->update(['is_read' => true]);
        return response()->json(['status' => 'success']);
    }
}
