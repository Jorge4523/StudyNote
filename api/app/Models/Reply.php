<?php

namespace App\Models;

// Mi clase de Respuesta (Reply), que es lo que escribimos dentro de un Note
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Reply extends Model
{
    // Solo necesito saber quién la escribe, en qué nota y qué dice
    protected $fillable = ['user_id', 'note_id', 'content'];

    // Me dice quién ha escrito esta respuesta
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Me dice a qué Note pertenece esta respuesta
    public function note(): BelongsTo
    {
        return $this->belongsTo(Note::class);
    }

    // Una respuesta puede tener votos positivos (up) o negativos (down)
    public function votes(): HasMany
    {
        return $this->hasMany(Vote::class);
    }
}
