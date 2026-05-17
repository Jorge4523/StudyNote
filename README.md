Jorge Peña Sobrado

Servicio Mail para creacion Usuarios https://mailtrap.io/ o codigo maestro 000000

---

# Guía de instalación y arranque del proyecto

Este proyecto está compuesto por un Backend (API) desarrollado con Laravel 11 y un Frontend desarrollado con React y Vite. La base de datos está configurada por defecto en SQLite, por lo que no es necesario instalar ni configurar MySQL o PostgreSQL.

A continuación se explican los pasos necesarios para instalar las dependencias y levantar ambos servidores en entorno de desarrollo local.

---

## Requisitos previos

Para poder ejecutar el proyecto necesitas tener instalado en tu sistema:
1. PHP (Versión 8.2 o superior)
2. Composer (para las dependencias de PHP)
3. Node.js (con npm)

---

## Paso 1: Configurar y arrancar el Backend (Laravel)

La parte del servidor se gestiona dentro de la carpeta `api`. Abre una terminal y sigue estos pasos:

1. **Entrar al directorio del backend:**
   ```bash
   cd api
   ```

2. **Instalar las dependencias de PHP:**
   ```bash
   composer install
   ```

3. **Configurar el entorno (.env):**
   Si no tienes un archivo `.env`, puedes crear una copia a partir del ejemplo:
   ```bash
   cp .env.example .env
   ```
   Después, genera la clave de la aplicación:
   ```bash
   php artisan key:generate
   ```

4. **Crear y preparar la base de datos (SQLite):**
   Por defecto la configuración ya apunta a un archivo SQLite en `database/database.sqlite`. Para asegurarte de que existe, puedes crearlo con los siguientes comandos según tu sistema operativo:
   * En **Windows (PowerShell)**:
     ```powershell
     New-Item -ItemType File -Path database\database.sqlite -Force
     ```
   * En **macOS, Linux o Git Bash**:
     ```bash
     touch database/database.sqlite
     ```
   Una vez creado el archivo vacío, ejecuta las migraciones para crear las tablas y añade los datos de prueba del seeder:
   ```bash
   php artisan migrate:fresh --seed
   ```
   *(Esto creará las tablas necesarias y cargará varios alumnos con notas de prueba para poder interactuar en el tablón desde el principio).*

5. **Arrancar el servidor de desarrollo:**
   ```bash
   php artisan serve
   ```
   La API backend se quedará corriendo en: **http://127.0.0.1:8000**

---

## Paso 2: Configurar y arrancar el Frontend (React + Vite)

Mientras dejas corriendo el servidor del backend en la terminal anterior, abre una **segunda terminal** en la raíz del proyecto para levantar el cliente web:

1. **Entrar en la carpeta del frontend:**
   ```bash
   cd frontend
   ```

2. **Instalar las dependencias de Node:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo de Vite:**
   ```bash
   npm run dev
   ```
   El frontend compilará la aplicación y estará accesible en tu navegador en: **http://localhost:5173**

---

## Pruebas de Registro e Inicio de sesión (2FA)

Por motivos de seguridad, el inicio de sesión y el registro solicitan un código de verificación de 6 dígitos que se envía al correo electrónico del usuario.

* **Mailtrap:** Si quieres simular el envío de correos real, configura tu cuenta de pruebas de Mailtrap en el archivo `api/.env` (en los campos `MAIL_USERNAME` y `MAIL_PASSWORD`).
* **Código Maestro:** Si no deseas configurar Mailtrap, puedes utilizar el código maestro **`000000`** en el formulario del navegador. El servidor está programado para aceptar este código como válido en cualquier verificación local sin necesidad de enviar ningún correo electrónico.