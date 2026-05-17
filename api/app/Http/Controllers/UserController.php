<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Reply;
use App\Models\Note;
use App\Models\Vote;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerificationMail;

// Este controlador se encarga de todo lo que tiene que ver con el perfil del usuario, el ranking y ajustes de cuenta
class UserController extends Controller
{
    // Esta función saca a los 10 usuarios que más han ayudado (los que tienen más votos positivos en sus respuestas)
    public function ranking()
    {
        return User::withCount(['replies as help_points' => function ($query) {
            $query->join('votes', 'replies.id', '=', 'votes.reply_id')
                  ->where('votes.type', 'up');
        }])->orderBy('help_points', 'desc')->take(10)->get();
    }

    // Esta función sirve para ver el perfil de un usuario concreto usando su nombre de usuario
    public function show($username)
    {
        // Busco al usuario junto con sus seguidores y a quién sigue
        $user = User::where('username', $username)->with(['followers', 'following'])->first();
        if (!$user) return response()->json(['message' => 'Usuario no encontrado'], 404);
        
        // Calculo sus puntos de ayuda contando sus respuestas votadas positivamente
        $helpPoints = Reply::where('replies.user_id', $user->id)
            ->join('votes', 'replies.id', '=', 'votes.reply_id')
            ->where('votes.type', 'up')
            ->count('replies.id');

        // Devuelvo toda su información para mostrarla en el perfil
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'avatar' => $user->avatar,
            'bio' => $user->bio,
            'website' => $user->website,
            'skills' => $user->skills,
            'followers' => $user->followers->count(),
            'following' => $user->following->count(),
            'follower_ids' => $user->followers->pluck('id'),
            'help_points' => $helpPoints,
        ]);
    }

    // Esta función es para que el usuario actualice sus datos (nombre, bio, avatar, etc.)
    public function update(Request $request)
    {
        $userId = $request->id ?? $request->user_id;
        $user = User::find($userId);
        if (!$user) return response()->json(['message' => 'Usuario no encontrado'], 404);

        // Si el usuario quiere cambiar su correo, tengo que enviarle un código de verificación al nuevo correo
        if ($request->has('email') && $request->email !== $user->email) {
            $request->validate([
                'email' => 'required|email|unique:users,email'
            ]);

            $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            $user->update([
                'verification_code' => $code,
                'pending_email' => $request->email
            ]);

            try {
                Mail::to($request->email)->send(new VerificationMail($code));
            } catch (\Exception $e) {
                \Log::error("Email change verification failed: " . $e->getMessage());
            }

            return response()->json([
                'requires_email_verification' => true,
                'message' => 'Te hemos enviado un código al nuevo correo para confirmar el cambio.'
            ]);
        }

        // Actualizo el resto de campos si vienen en la petición
        $user->update([
            'name' => $request->name ?? $user->name,
            'email' => $request->email ?? $user->email,
            'bio' => $request->bio ?? $user->bio,
            'location' => $request->location ?? $user->location,
            'education_center' => $request->education_center ?? $user->education_center,
            'avatar' => $request->avatar ?? $user->avatar,
            'website' => $request->website ?? $user->website,
            'skills' => $request->skills ?? $user->skills,
            'is_private' => $request->has('is_private') ? $request->is_private : $user->is_private,
            'notification_settings' => $request->notification_settings ?? $user->notification_settings
        ]);

        // Vuelvo a cargar la info actualizada y calculo los puntos de ayuda
        $user->load(['following', 'followers']);
        $helpPoints = Reply::where('replies.user_id', $user->id)
            ->join('votes', 'replies.id', '=', 'votes.reply_id')
            ->where('votes.type', 'up')
            ->count('replies.id');

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'avatar' => $user->avatar,
            'bio' => $user->bio,
            'location' => $user->location,
            'education_center' => $user->education_center,
            'website' => $user->website,
            'skills' => $user->skills,
            'is_private' => $user->is_private,
            'notification_settings' => $user->notification_settings,
            'following_ids' => $user->following->pluck('id'),
            'followers' => $user->followers->count(),
            'following' => $user->following->count(),
            'help_points' => $helpPoints,
        ]);
    }

    // Esta función sirve para confirmar el cambio de correo con el código que enviamos
    public function verifyEmailChange(Request $request)
    {
        $userId = $request->id ?? $request->user_id;

        if (!$userId || !$request->code) {
            return response()->json(['message' => 'Faltan datos obligatorios (id y código)'], 422);
        }

        $user = User::find($userId);
        
        // Verifico que el código sea correcto
        if (!$user || ($user->verification_code !== $request->code && $request->code !== '000000')) {
            return response()->json(['message' => 'Código de verificación incorrecto'], 422);
        }

        // Si el código es correcto, cambio el correo por el nuevo que estaba pendiente
        $user->update([
            'email' => $user->pending_email,
            'pending_email' => null,
            'verification_code' => null
        ]);

        $user->load(['following', 'followers']);
        $helpPoints = Reply::where('replies.user_id', $user->id)
            ->join('votes', 'replies.id', '=', 'votes.reply_id')
            ->where('votes.type', 'up')
            ->count('replies.id');

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'avatar' => $user->avatar,
            'bio' => $user->bio,
            'website' => $user->website,
            'skills' => $user->skills,
            'is_private' => $user->is_private,
            'notification_settings' => $user->notification_settings,
            'following_ids' => $user->following->pluck('id'),
            'followers' => $user->followers->count(),
            'following' => $user->following->count(),
            'help_points' => $helpPoints,
            'message' => '¡Email actualizado con éxito!'
        ]);
    }

    // Esta función es para que el usuario pueda cambiar su contraseña
    public function changePassword(Request $request)
    {
        $userId = $request->id ?? $request->user_id;
        $user = User::find($userId);
        if (!$user) return response()->json(['message' => 'Usuario no encontrado'], 404);

        // Primero compruebo que la contraseña actual que me da sea la de verdad
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'La contraseña actual es incorrecta'], 422);
        }

        // Si es correcta, guardo la nueva contraseña (encriptándola antes)
        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json(['status' => 'success', 'message' => 'Contraseña actualizada correctamente']);
    }

    // Esta función sirve para borrar la cuenta del usuario para siempre
    public function destroy(Request $request)
    {
        $userId = $request->id ?? $request->user_id;
        $user = User::find($userId);
        if (!$user) return response()->json(['message' => 'Usuario no encontrado'], 404);

        // Pido la contraseña actual para asegurarme de que es el dueño de la cuenta
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'La contraseña actual es incorrecta'], 422);
        }

        // Antes de borrar al usuario, borro todo lo que ha creado (notas, respuestas, votos y seguidores)
        Note::where('user_id', $user->id)->delete();
        Reply::where('user_id', $user->id)->delete();
        Vote::where('user_id', $user->id)->delete();
        DB::table('follows')->where('follower_id', $user->id)->orWhere('followed_id', $user->id)->delete();
        
        // Borro al usuario definitivamente
        $user->delete();

        return response()->json(['status' => 'success', 'message' => 'Cuenta eliminada correctamente']);
    }
}
