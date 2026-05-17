<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Note;
use App\Models\User;
use App\Models\Reply;

// Este controlador sirve para buscar cosas en la aplicación (notas, usuarios o respuestas)
class SearchController extends Controller
{
    // Esta función recibe lo que el usuario escribe en el buscador y devuelve los resultados
    public function index(Request $request)
    {
        // Cojo el texto que han escrito
        $q = $request->query('q');
        // Si no han escrito nada, devuelvo todo vacío
        if (!$q) return response()->json(['notes' => [], 'users' => [], 'replies' => []]);

        // Busco notas que coincidan en el tema o en el contenido
        $notes = Note::where('topic', 'like', "%$q%")
            ->orWhere('content', 'like', "%$q%")
            ->with('author')
            ->take(6) // Solo traigo los 6 primeros para que sea rápido
            ->get();

        // Busco usuarios por su nombre o por su @usuario
        $users = User::where('name', 'like', "%$q%")
            ->orWhere('username', 'like', "%$q%")
            ->take(6)
            ->get();

        // También busco entre las respuestas que se han escrito
        $replies = Reply::where('content', 'like', "%$q%")
            ->with(['note.author', 'author'])
            ->take(6)
            ->get();

        // Devuelvo todos los resultados juntos
        return response()->json([
            'notes' => $notes,
            'users' => $users,
            'replies' => $replies
        ]);
    }
}
