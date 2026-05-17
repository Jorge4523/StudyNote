<x-mail::message>
# ¡Hola, {{ $user->name }}!

Bienvenido a **StudyNote**, la red social donde los estudiantes se ayudan entre sí.

Estamos encantados de tenerte con nosotros. Ahora puedes compartir tus apuntes, resolver dudas y conectar con otros estudiantes de tu misma carrera o intereses.

<x-mail::button :url="config('app.url')">
Ir a StudyNote
</x-mail::button>

Si tienes alguna duda, simplemente responde a este correo.

</x-mail::message>
