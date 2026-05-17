<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Vote;

// Este controlador sirve para votar las respuestas (voto positivo para ayudar, o negativo si no es útil)
class VoteController extends Controller
{
    // Esta función maneja cuando alguien vota una respuesta
    public function toggle(Request $request)
    {
        // Si faltan datos, aviso de que algo va mal
        if (!$request->user_id || !$request->reply_id) return response()->json(['message' => 'Faltan datos'], 400);

        // Miro si el usuario ya había votado esta misma respuesta antes
        $existing = Vote::where('user_id', $request->user_id)->where('reply_id', $request->reply_id)->first();
        
        if ($existing) {
            // Si el voto que envía es igual al que ya tenía, lo borro (quitar el voto)
            if ($existing->type === $request->type) {
                $existing->delete();
                return response()->json(['status' => 'removed']);
            } else {
                // Si el voto es distinto (por ejemplo, cambia de positivo a negativo), lo actualizo
                $existing->update(['type' => $request->type]);
                return response()->json(['status' => 'updated']);
            }
        } else {
            // Si no había votado nunca, creo el voto nuevo (positivo o negativo)
            Vote::create([
                'user_id' => $request->user_id,
                'reply_id' => $request->reply_id,
                'type' => $request->type
            ]);
            return response()->json(['status' => 'created']);
        }
    }
}
