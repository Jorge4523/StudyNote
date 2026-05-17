<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Notification;

// Este controlador sirve para manejar cuando un alumno sigue a otro o deja de seguirlo
class FollowController extends Controller
{
    // Esta función hace el "cambio": si no le sigues, le empiezas a seguir; si ya le seguías, le dejas de seguir
    public function toggle(Request $request)
    {
        // Busco a los dos usuarios: el que da a seguir y el que es seguido
        $follower = User::find($request->follower_id);
        $followed = User::find($request->followed_id);

        if (!$follower || !$followed) return response()->json(['message' => 'Usuario no encontrado'], 404);

        // Si ya le seguía antes...
        if ($follower->following()->where('followed_id', $followed->id)->exists()) {
            // Le dejo de seguir (lo quito de la lista)
            $follower->following()->detach($followed->id);
            return response()->json(['status' => 'unfollowed']);
        } else {
            // Si no le seguía, lo añado a mi lista de seguidos
            $follower->following()->attach($followed->id);
            
            // Y le mando una notificación para que sepa que tiene un nuevo seguidor
            Notification::create([
                'user_id' => $followed->id,
                'actor_id' => $follower->id,
                'type' => 'follow',
                'data' => []
            ]);
            
            return response()->json(['status' => 'followed']);
        }
    }
}
