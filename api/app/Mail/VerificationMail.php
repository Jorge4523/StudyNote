<?php

namespace App\Mail;

// Clase para enviar el correo con el código de seguridad
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerificationMail extends Mailable
{
    use Queueable, SerializesModels;

    // Aquí guardo el código que voy a meter en el mensaje
    public $code;

    /**
     * Preparo el correo con el código que me pasen
     */
    public function __construct($code)
    {
        $this->code = $code;
    }

    /**
     * Configuro el asunto del mensaje
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Tu código de verificación para StudyNote',
        );
    }

    /**
     * Indico qué plantilla de texto voy a usar para el correo
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.verification', // Uso una plantilla Markdown que es más limpia
        );
    }

    /**
     * No mando archivos adjuntos
     */
    public function attachments(): array
    {
        return [];
    }
}
