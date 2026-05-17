<?php

namespace App\Models;

// Mi modelo para los votos en las respuestas
use Illuminate\Database\Eloquent\Model;

class Vote extends Model
{
    // Guardo quién vota, a qué respuesta y si es positivo (up) o negativo (down)
    protected $fillable = ['user_id', 'reply_id', 'type'];
}
