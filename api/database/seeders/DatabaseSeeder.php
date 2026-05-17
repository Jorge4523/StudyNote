<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Note;
use App\Models\Reply;
use App\Models\Vote;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Limpiamos las tablas antes de rellenar (SQLite)
        DB::statement('PRAGMA foreign_keys = OFF;');
        User::truncate();
        Note::truncate();
        Reply::truncate();
        Vote::truncate();
        DB::table('follows')->truncate();
        DB::table('saves')->truncate();
        DB::table('notifications')->truncate();
        DB::statement('PRAGMA foreign_keys = ON;');

        // --- 1. USUARIOS (ESTUDIANTES) ---

        $alex = User::create([
            'name' => 'Alex Johnson',
            'username' => 'alexj',
            'email' => 'alex@example.com',
            'password' => Hash::make('password'),
            'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
            'bio' => 'Estudiante de Ingeniería. Amante del código limpio y el café.',
            'skills' => ['Programacion', 'Matematicas'],
            'location' => 'Madrid',
            'education_center' => 'UPM'
        ]);

        $maria = User::create([
            'name' => 'María García',
            'username' => 'mariag',
            'email' => 'maria@example.com',
            'password' => Hash::make('password'),
            'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
            'bio' => 'Futura científica. La física es mi pasión.',
            'skills' => ['Fisica', 'Quimica'],
            'location' => 'Barcelona',
            'education_center' => 'UB'
        ]);

        $carlos = User::create([
            'name' => 'Carlos Ruiz',
            'username' => 'cruiz',
            'email' => 'carlos@example.com',
            'password' => Hash::make('password'),
            'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
            'bio' => 'Apasionado de la historia y las letras.',
            'skills' => ['Historia'],
            'location' => 'Sevilla',
            'education_center' => 'US'
        ]);

        $ana = User::create([
            'name' => 'Ana López',
            'username' => 'analop',
            'email' => 'ana@example.com',
            'password' => Hash::make('password'),
            'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
            'bio' => 'Buscando entender el mundo a través de la Biología.',
            'skills' => ['Biologia', 'Quimica'],
            'location' => 'Valencia',
            'education_center' => 'UV'
        ]);

        $sofia = User::create([
            'name' => 'Sofía Martínez',
            'username' => 'sofim',
            'email' => 'sofia@example.com',
            'password' => Hash::make('password'),
            'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
            'bio' => 'Matemáticas aplicadas y análisis de datos.',
            'skills' => ['Matematicas', 'Programacion'],
            'location' => 'Bilbao',
            'education_center' => 'UPV'
        ]);

        // --- 2. NOTAS DE ESTUDIO (NOTES) ---

        // Física
        $n1 = Note::create([
            'user_id' => $maria->id,
            'topic' => 'Fisica',
            'content' => '¿Cómo se aplican las leyes de termodinámica en la vida cotidiana? Tengo examen mañana y necesito ejemplos claros.',
            'created_at' => now()->subDays(1)
        ]);

        // Programación
        $n2 = Note::create([
            'user_id' => $alex->id,
            'topic' => 'Programacion',
            'content' => 'Mis Notes sobre POO en JavaScript. Incluye ejemplos de clases, herencia y polimorfismo. ¡Espero que os sirvan!',
            'created_at' => now()->subHours(12)
        ]);

        // Historia
        $n3 = Note::create([
            'user_id' => $carlos->id,
            'topic' => 'Historia',
            'content' => 'Resumen de la Revolución Francesa en 10 puntos clave. Ideal para selectividad.',
            'created_at' => now()->subHours(5)
        ]);

        // Biología
        $n4 = Note::create([
            'user_id' => $ana->id,
            'topic' => 'Biologia',
            'content' => 'Explicación del ciclo de Krebs de forma visual. ¿Alguien tiene algún truco mnemotécnico para aprenderse los pasos?',
            'created_at' => now()->subHours(2)
        ]);

        // Matemáticas
        $n5 = Note::create([
            'user_id' => $sofia->id,
            'topic' => 'Matematicas',
            'content' => 'Resolución de integrales triples paso a paso. Si tenéis dudas con el cambio a coordenadas polares, preguntad.',
            'created_at' => now()->subMinutes(30)
        ]);

        // --- 3. RESPUESTAS (REPLIES) ---

        $r1 = Reply::create([
            'user_id' => $alex->id,
            'note_id' => $n1->id,
            'content' => 'El ejemplo más común es una nevera o el motor de un coche. Básicamente, se trata de transferencia de calor y trabajo.',
            'created_at' => now()->subHours(20)
        ]);

        $r2 = Reply::create([
            'user_id' => $sofia->id,
            'note_id' => $n2->id,
            'content' => '¡Buenísimos Notes! Me ayudó mucho la parte del polimorfismo, no me quedaba clara la diferencia con la herencia simple.',
            'created_at' => now()->subHours(10)
        ]);

        $r3 = Reply::create([
            'user_id' => $ana->id,
            'note_id' => $n4->id,
            'content' => 'Yo uso la frase "Can I Keep Selling Substances For Money, Officer?" para los ácidos. ¡Funciona genial!',
            'created_at' => now()->subMinutes(45)
        ]);

        // --- 4. VOTOS (SISTEMA DE RANKING) ---

        $users = [$alex, $maria, $carlos, $ana, $sofia];

        // R1 tiene muchos votos (Alex ayuda mucho)
        foreach ($users as $u) {
            if ($u->id !== $alex->id) {
                Vote::create(['user_id' => $u->id, 'reply_id' => $r1->id, 'type' => 'up']);
            }
        }

        // R3 tiene votos positivos
        Vote::create(['user_id' => $alex->id, 'reply_id' => $r3->id, 'type' => 'up']);
        Vote::create(['user_id' => $maria->id, 'reply_id' => $r3->id, 'type' => 'up']);

        // --- 5. SISTEMA SOCIAL (FOLLOWS) ---

        $alex->following()->attach([$maria->id, $sofia->id]);
        $maria->following()->attach([$alex->id, $ana->id]);
        $ana->following()->attach([$maria->id, $alex->id, $sofia->id]);
        $sofia->following()->attach([$alex->id]);
    }
}
