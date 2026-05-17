<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Note;
use App\Models\Reply;
use App\Models\Vote;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Temas de ejemplo
        $topics = ['Matemáticas', 'Historia', 'Programación', 'Derecho', 'Medicina', 'Arte', 'Idiomas', 'Ciencias'];
        
        // Nombres de ejemplo
        $names = [
            'Carlos Ruiz', 'Elena Martínez', 'David García', 'Sofía López', 
            'Javier Fernández', 'Lucía Sánchez', 'Marcos Pérez', 'Paula Gómez',
            'Adrián Díaz', 'Marta Torres', 'Sergio Moreno', 'Irene Jiménez',
            'Hugo Navarro', 'Sara Expósito', 'Iván Castro'
        ];

        $seeds = ['Felix', 'Aneka', 'Oliver', 'Mimi', 'Jasper', 'Sasha', 'Leo', 'Mia', 'Coco', 'Toby', 'Zoe', 'Luna', 'Simba', 'Nala', 'Bruno'];

        foreach ($names as $index => $name) {
            $username = strtolower(explode(' ', $name)[0]) . rand(10, 99);
            
            $user = User::create([
                'name' => $name,
                'username' => $username,
                'email' => $username . '@example.com',
                'password' => Hash::make('password'),
                'avatar' => "https://api.dicebear.com/7.x/avataaars/svg?seed=" . $seeds[$index],
                'bio' => "Estudiante de " . $topics[array_rand($topics)] . " apasionado por aprender.",
                'location' => ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'][array_rand(['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'])],
                'education_center' => 'Universidad Pública',
                'skills' => array_slice($topics, 0, rand(2, 4))
            ]);

            // Cada usuario crea de 1 a 3 notes
            for ($i = 0; $i < rand(1, 3); $i++) {
                $topic = $topics[array_rand($topics)];
                Note::create([
                    'user_id' => $user->id,
                    'content' => "Hola a todos, estoy teniendo problemas con este ejercicio de $topic. ¿Alguien me puede dar una pista sobre cómo empezar?",
                    'topic' => $topic
                ]);
            }
        }

        // Crear respuestas y votos
        $allUsers = User::all();
        $allNotes = Note::all();

        foreach ($allNotes as $note) {
            // Cada note tiene de 1 a 4 respuestas
            $repliers = $allUsers->where('id', '!=', $note->user_id)->random(rand(1, 4));
            
            foreach ($repliers as $replier) {
                $reply = Reply::create([
                    'note_id' => $note->id,
                    'user_id' => $replier->id,
                    'content' => "¡Hola! Yo te puedo ayudar con eso de " . $note->topic . ". Lo primero que tienes que hacer es..."
                ]);

                // Cada respuesta tiene de 0 a 8 votos positivos para generar ranking
                $voters = $allUsers->where('id', '!=', $replier->id)->random(rand(0, 8));
                foreach ($voters as $voter) {
                    Vote::create([
                        'reply_id' => $reply->id,
                        'user_id' => $voter->id,
                        'type' => 'up'
                    ]);
                }
            }
        }
    }
}
