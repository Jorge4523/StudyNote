<?php

namespace App\Models;

// Mi modelo para guardar notas en la biblioteca personal
use Illuminate\Database\Eloquent\Model;

class Save extends Model
{
    // Guardo la relación entre el usuario y la nota que ha decidido marcar
    protected $fillable = ['user_id', 'note_id'];
}
