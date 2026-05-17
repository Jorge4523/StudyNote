<?php

namespace App\Models;

// Mi clase de Notificación, para avisar a los usuarios de lo que pasa en la app
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    // Guardo quién recibe el aviso, quién lo provoca, el tipo (like, follow...) y datos extra
    protected $fillable = ['user_id', 'actor_id', 'type', 'data', 'is_read'];

    // Me aseguro de que los datos extra sean un array y que el estado de lectura sea un booleano
    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
    ];

    // El usuario que va a ver la notificación en su campana
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // El usuario que ha hecho la acción (por ejemplo, el que te ha dado like)
    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
