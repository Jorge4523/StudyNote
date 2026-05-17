<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Save;

// Este controlador sirve para guardar notas en tu biblioteca personal para verlas luego
class SaveController extends Controller
{
    // Esta función hace que si le das a "Guardar", se guarde, y si le vuelves a dar, se quite de guardados
    public function toggle(Request $request)
    {
        // Miro si el usuario ya tenía guardada esta nota
        $existing = Save::where('user_id', $request->user_id)->where('note_id', $request->note_id)->first();
        
        if ($existing) {
            // Si ya la tenía, la borro de sus guardados
            $existing->delete();
            return response()->json(['status' => 'unsaved']);
        } else {
            // Si no, la guardo nueva
            Save::create(['user_id' => $request->user_id, 'note_id' => $request->note_id]);
            return response()->json(['status' => 'saved']);
        }
    }
}
