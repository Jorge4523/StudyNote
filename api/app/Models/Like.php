<?php

namespace App\Models;

// Mi modelo para los "Me gusta" en las notas
use Illuminate\Database\Eloquent\Model;

class Like extends Model
{
    // Solo necesito saber quién dio el like y en qué nota
    protected $fillable = ['user_id', 'note_id'];
}
