<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Note;
use App\Models\Reply;
use App\Models\Like;
use App\Models\Save;
use App\Models\Notification;

// Este controlador maneja todo lo que tiene que ver con las notas (estudiar, crear notas, borrarlas, etc.)
class NoteController extends Controller
{
    // Esta función sirve para traer todas las notas y mostrarlas en el muro o feed
    public function index(Request $request)
    {
        // Uso el offset y el limit para no cargar todas las notas de golpe (paginación)
        $offset = $request->query('offset', 0);
        $limit = $request->query('limit', 6);

        // Busco las notas con sus autores, respuestas, likes y guardados
        return Note::with(['author', 'replies.author', 'replies.votes', 'likes', 'saves'])
            ->orderBy('created_at', 'desc') // Las más recientes primero
            ->skip($offset)
            ->take($limit)
            ->get()
            ->map(function ($note) {
                // Aquí preparo los datos de cada nota para el frontend
                return [
                    'id' => $note->id,
                    'topic' => $note->topic,
                    'content' => $note->content,
                    'image' => $note->image,
                    'file' => $note->file,
                    'file_name' => $note->file_name,
                    'createdAt' => $note->created_at,
                    'author' => [
                        'id' => $note->author->id,
                        'name' => $note->author->name,
                        'username' => $note->author->username,
                        'avatar' => $note->author->avatar,
                    ],
                    'likes' => $note->likes->pluck('user_id')->toArray(), // Lista de IDs de gente que le dio like
                    'saves' => $note->saves->pluck('user_id')->toArray(), // Lista de IDs de gente que la guardó
                    'repliesCount' => $note->replies->count(),
                    'replies' => $note->replies->map(function ($reply) {
                        // También preparo las respuestas de la nota
                        $upvotes = $reply->votes->where('type', 'up')->count();
                        $downvotes = $reply->votes->where('type', 'down')->count();
                        
                        return [
                            'id' => $reply->id,
                            'content' => $reply->content,
                            'createdAt' => $reply->created_at,
                            'upvotes' => $upvotes,
                            'downvotes' => $downvotes,
                            'votesData' => $reply->votes->map(function ($v) { 
                                return ['user_id' => $v->user_id, 'type' => $v->type]; 
                            })->toArray(),
                            'author' => [
                                'id' => $reply->author->id,
                                'name' => $reply->author->name,
                                'username' => $reply->author->username,
                                'avatar' => $reply->author->avatar,
                            ]
                        ];
                    })
                ];
            });
    }

    public function store(Request $request)
    {
        // Validamos que al menos tenga algo (texto o imagen). El tema es obligatorio.
        $request->validate([
            'topic' => 'required|string',
            'content' => 'nullable|string',
            'image' => 'nullable|string',
        ]);

        // Intentamos sacar el ID del usuario de varias formas para no fallar
        $userId = $request->user_id;
        if (!$userId && $request->user()) {
            $userId = $request->user()->id;
        }

        // Si aún así no hay usuario, devolvemos error claro
        if (!$userId) {
            return response()->json(['message' => 'No se ha podido identificar al usuario'], 401);
        }

        // Creamos la nota
        $note = Note::create([
            'user_id' => $userId,
            'topic' => $request->topic,
            'content' => $request->content,
            'image' => $request->image ?? null,
            'file' => $request->file ?? null,
            'file_name' => $request->file_name ?? null,
        ]);
        
        // Devolvemos la nota con su autor cargado
        return response()->json($note->load('author'), 201);
    }

    // Esta función sirve para borrar una nota que ya no queramos
    public function destroy($id, Request $request)
    {
        // Busco la nota por su ID
        $note = Note::find($id);
        if (!$note) return response()->json(['message' => 'Note no encontrado'], 404);
        
        // Compruebo que el usuario que intenta borrarla sea el mismo que la creó
        $userId = $request->user_id ?? $request->input('user_id');
        if ($userId != $note->user_id) {
            return response()->json(['message' => 'No tienes permiso para borrar este Note'], 403);
        }

        // Antes de borrar la nota, borro también las notificaciones, likes, guardados y respuestas asociadas
        try {
            Notification::where('data', 'like', '%"note_id":' . $id . '%')->delete();
        } catch (\Exception $e) {}
        
        Like::where('note_id', $id)->delete();
        Save::where('note_id', $id)->delete();
        Reply::where('note_id', $id)->delete();
        
        // Por último, borro la nota definitiva
        $note->delete();
        
        return response()->json(['status' => 'success']);
    }
}
