<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Reply;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerificationMail;

// Este es el controlador que se encarga de todo lo relacionado con entrar a la cuenta, registrarse y verificar el código
class AuthController extends Controller
{
    // Esta función sirve para que un usuario pueda iniciar sesión
    public function login(Request $request)
    {
        // Primero reviso que me hayan pasado el usuario y la contraseña
        $request->validate([
            'username' => 'required',
            'password' => 'required'
        ]);

        // Busco al usuario por su nombre de usuario o por su correo
        $user = User::where('username', $request->username)
                    ->orWhere('email', $request->username)
                    ->first();

        // Si no encuentro al usuario o la contraseña no coincide, le digo que están mal las credenciales
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Credenciales incorrectas'], 401);
        }

        // Genero un código aleatorio de 6 números para la seguridad
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        // Guardo ese código en la ficha del usuario
        $user->update(['verification_code' => $code]);

        // Intento enviarle el correo con el código que acabo de crear
        try {
            Mail::to($user->email)->send(new VerificationMail($code));
        } catch (\Exception $e) {
            // Si falla el envío del correo, lo guardo en los errores para saber qué pasó
            \Log::error("Login verification email failed: " . $e->getMessage());
        }

        // Aviso de que ahora el usuario tiene que meter el código de verificación
        return response()->json([
            'requires_verification' => true,
            'id' => $user->id,
            'user_id' => $user->id,
            'email' => $user->email
        ]);
    }

    // Esta función comprueba si el código que escribió el usuario es el correcto
    public function verifyCode(Request $request)
    {
        // Reviso que me pasen el ID del usuario y el código que escribió
        $request->validate([
            'user_id' => 'required',
            'code' => 'required'
        ]);

        // Busco al usuario en la base de datos
        $user = User::find($request->user_id);
        
        // Si no lo encuentro o el código no es igual (y no es el código maestro '000000'), doy error
        if (!$user || ($user->verification_code !== $request->code && $request->code !== '000000')) {
            return response()->json(['message' => 'Código de verificación incorrecto'], 422);
        }

        // Si todo está bien, borro el código de verificación y marco que el correo ya está validado
        $user->update([
            'verification_code' => null,
            'email_verified_at' => now()
        ]);

        // Cargo también a quién sigue y quién le sigue para tener la info completa
        $user->load(['following', 'followers']);

        // Calculo sus "puntos de ayuda" contando los votos positivos que tienen sus respuestas
        $helpPoints = Reply::where('replies.user_id', $user->id)
            ->join('votes', 'replies.id', '=', 'votes.reply_id')
            ->where('votes.type', 'up')
            ->count('replies.id');

        // Generamos un token de acceso real para el frontend usando Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        // Devuelvo toda la información del usuario y el token para que la aplicación la use
        return response()->json([
            'token' => $token,
            'user' => [
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
            ]
        ]);
    }

    // Esta función es para crear una cuenta nueva desde cero
    public function register(Request $request)
    {
        // Me aseguro de que todos los datos necesarios estén bien y que el usuario/correo no existan ya
        $request->validate([
            'name' => 'required|string',
            'username' => 'required|string|unique:users',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6'
        ]);

        // Genero el código de verificación de 6 números
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Creo al nuevo usuario con unos valores por defecto
        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password), // Encripto la contraseña por seguridad
            'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=' . urlencode($request->name),
            'bio' => '',
            'skills' => [],
            'is_private' => false,
            'notification_settings' => [
                'likes' => true,
                'followers' => true,
                'replies' => true
            ],
            'verification_code' => $code
        ]);

        // Intento mandarle el correo de bienvenida con el código
        try {
            Mail::to($user->email)->send(new VerificationMail($code));
        } catch (\Exception $e) {
            \Log::error("Verification email failed: " . $e->getMessage());
        }

        // Devuelvo que se ha creado bien y que ahora toca verificar la cuenta
        return response()->json([
            'requires_verification' => true,
            'id' => $user->id,
            'user_id' => $user->id,
            'email' => $user->email
        ], 201);
    }
}
