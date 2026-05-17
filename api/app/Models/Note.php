<?php

namespace App\Models;

// Mi clase de Note, representa cada publicación que se hace en el muro
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Note extends Model
{
    // Estos son los datos básicos de un Note: quién lo escribió, el tema, el texto y archivos opcionales
    protected $fillable = ['user_id', 'topic', 'content', 'image', 'file', 'file_name'];

    // Me dice quién es el autor de este Note
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Un Note puede tener un montón de respuestas de otros alumnos
    public function replies(): HasMany
    {
        return $this->hasMany(Reply::class);
    }

    // Aquí guardo todos los "Me gusta" que ha recibido este Note
    public function likes(): HasMany
    {
        return $this->hasMany(Like::class);
    }

    // Y aquí quiénes lo han guardado en su biblioteca personal
    public function saves(): HasMany
    {
        return $this->hasMany(Save::class);
    }
}
