<?php

namespace App\Models;

// Mi clase de Usuario, aquí es donde guardo a todas las personas que usan StudyNote
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    // Estos son los campos que permito que se rellenen en mi base de datos
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'avatar',
        'bio',
        'location',
        'education_center',
        'website',
        'skills',
        'is_private',
        'notification_settings',
        'verification_code',
        'pending_email',
    ];

    // Le digo a Laravel cómo debe tratar cada campo (si es un array, un booleano, etc.)
    protected $casts = [
        'email_verified_at' => 'datetime',
        'skills' => 'array',
        'is_private' => 'boolean',
        'notification_settings' => 'array',
    ];

    // Un usuario puede haber escrito muchas notas (Notes)
    public function notes()
    {
        return $this->hasMany(Note::class);
    }

    // Y también muchas respuestas a las notas de otros
    public function replies()
    {
        return $this->hasMany(Reply::class);
    }

    // Esta relación me dice quiénes siguen a este usuario
    public function followers()
    {
        return $this->belongsToMany(User::class, 'follows', 'followed_id', 'follower_id');
    }

    // Y esta me dice a quiénes está siguiendo este usuario
    public function following()
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'followed_id');
    }

    // Una función rápida para saber si sigo a alguien en concreto
    public function isFollowing(User $user)
    {
        return $this->following()->where('followed_id', $user->id)->exists();
    }
}
