<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reply;
use App\Models\Note;
use App\Models\Notification;

// Este controlador sirve para manejar las respuestas que los alumnos escriben en las notas
class ReplyController extends Controller
{
    // Esta función guarda una nueva respuesta en la base de datos
    public function store(Request $request)
    {
        // Creo la respuesta con el usuario, la nota y el texto
        $reply = Reply::create([
            'user_id' => $request->user_id,
            'note_id' => $request->note_id,
            'content' => $request->content,
        ]);
        
        // Busco la nota original para saber a quién notificar
        $note = Note::find($request->note_id);
        // Si la nota existe y no la he escrito yo mismo, le aviso al dueño de que tiene una respuesta nueva
        if ($note && $note->user_id != $request->user_id) {
            Notification::create([
                'user_id' => $note->user_id,
                'actor_id' => $request->user_id,
                'type' => 'reply',
                'data' => ['note_id' => $note->id, 'reply_content' => substr($request->content, 0, 50)]
            ]);
        }
        
        // Devuelvo la respuesta que se acaba de crear
        return response()->json($reply, 201);
    }
}
