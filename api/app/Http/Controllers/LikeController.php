<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Like;
use App\Models\Note;
use App\Models\Notification;

// Este controlador sirve para manejar los "Me gusta" en las notas
class LikeController extends Controller
{
    // Esta función hace que si le das clic a "Me gusta", se guarde, y si le vuelves a dar, se quite
    public function toggle(Request $request)
    {
        // Miro si este usuario ya le había dado Like a esta nota antes
        $existing = Like::where('user_id', $request->user_id)->where('note_id', $request->note_id)->first();
        
        if ($existing) {
            // Si ya existía, lo borro (quitar el Like)
            $existing->delete();
            return response()->json(['status' => 'unliked']);
        } else {
            // Si no existía, lo creo (dar Like)
            Like::create(['user_id' => $request->user_id, 'note_id' => $request->note_id]);
            
            // Busco la nota para saber a quién avisar
            $note = Note::find($request->note_id);
            // Si la nota existe y no es mía, le mando una notificación al dueño
            if ($note && $note->user_id != $request->user_id) {
                Notification::create([
                    'user_id' => $note->user_id,
                    'actor_id' => $request->user_id,
                    'type' => 'like',
                    'data' => ['note_id' => $note->id, 'note_content' => substr($note->content, 0, 50)]
                ]);
            }
            
            return response()->json(['status' => 'liked']);
        }
    }
}
