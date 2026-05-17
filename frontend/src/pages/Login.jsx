import React, { useState, useContext, useEffect, useRef } from 'react';
import { BookOpen } from 'lucide-react';
import { AuthContext } from '../App';

const Login = () => {
  // Funciones necesarias del Contexto de autenticación
  const { login, register, finishLogin, api } = useContext(AuthContext);

  // --- ESTADOS ---
  const [isRegistering, setIsRegistering] = useState(false); // Modo registro o login
  const [error, setError] = useState('');                   // Mensajes de error
  const [isVerifying, setIsVerifying] = useState(false);     // Petición del código de 6 números

  // Código de verificación como un array de 6 posiciones vacías
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);

  // Referencias para controlar el foco del cursor en los inputs
  const inputRefs = useRef([]);

  const [pendingUserId, setPendingUserId] = useState(null);  // ID del usuario mientras verifica
  const [pendingEmail, setPendingEmail] = useState('');      // Email para mostrar en pantalla durante verificación

  // Actualización del título de la pestaña del navegador según la vista
  useEffect(() => {
    if (isVerifying) {
      document.title = 'Verifica tu cuenta | StudyNote';
    } else {
      document.title = isRegistering ? 'Registro | StudyNote' : 'Iniciar Sesión | StudyNote';
    }
  }, [isRegistering, isVerifying]);

  // --- LÓGICA PARA EL CÓDIGO DE VERIFICACIÓN (6 CASILLAS) ---

  // Se ejecuta al escribir en una de las 6 casillas
  const handleCodeChange = (index, value) => {
    // Solo se permiten números
    if (!/^\d*$/.test(value)) return;

    const newCode = [...verificationCode];
    // Se toma solo el último carácter ingresado
    const lastChar = value.slice(-1);
    newCode[index] = lastChar;
    setVerificationCode(newCode);

    // Salto automático a la siguiente casilla
    if (lastChar && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Detección de la tecla borrar para volver a la casilla anterior
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!verificationCode[index] && index > 0) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  // --- FORMULARIOS DE ACCESO ---

  // Estados de los campos de texto
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Control de campos inválidos para resaltar en rojo
  const [invalidFields, setInvalidFields] = useState([]);

  // Gestión del envío del formulario (Login o Registro)
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evitar recarga de página
    setError('');
    const newInvalidFields = [];

    // Validación de campos vacíos
    if (isRegistering) {
      if (!name) newInvalidFields.push('name');
      if (!username) newInvalidFields.push('username');
      if (!email) newInvalidFields.push('email');
      if (!password) newInvalidFields.push('password');

      if (newInvalidFields.length > 0) {
        setInvalidFields(newInvalidFields);
        setError('Por favor, completa todos los campos');
        return;
      }
      if (!email.includes('@')) {
        setInvalidFields(['email']);
        setError('El correo electrónico no es válido.');
        return;
      }
    } else {
      if (!username) newInvalidFields.push('username');
      if (!password) newInvalidFields.push('password');

      if (newInvalidFields.length > 0) {
        setInvalidFields(newInvalidFields);
        setError('Debes introducir tu usuario y contraseña.');
        return;
      }
    }

    try {
      setInvalidFields([]);
      let data;
      // Petición al servidor (Laravel)
      if (isRegistering) {
        data = await register({ name, username, email, password });
      } else {
        data = await login(username, password);
      }

      // Si se requiere verificación de email
      if (data?.requires_verification) {
        setPendingUserId(data.user_id);
        setPendingEmail(data.email);
        setIsVerifying(true); // Cambiar a la vista de verificación
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error en la autenticación. Revisa tus credenciales.');
    }
  };

  // Gestión de la verificación del código
  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    // Unión de los 6 dígitos
    const fullCode = verificationCode.join('');
    if (fullCode.length < 6) {
      setError('Por favor, introduce el código completo');
      return;
    }

    try {
      // Envío del código para comprobación
      const res = await api.post('/verify-code', {
        user_id: pendingUserId,
        code: fullCode
      });
      // Si es correcto, se finaliza el login
      finishLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Código incorrecto');
    }
  };

  // Limpieza de estados de error al escribir en un campo
  const handleInputChange = (field, value, setter) => {
    setter(value);
    if (invalidFields.includes(field)) {
      setInvalidFields(prev => prev.filter(f => f !== field));
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-color)', overflow: 'hidden' }}>

      {/* SECCIÓN IZQUIERDA: Diseño y Branding */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Elementos decorativos de fondo */}
        <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)', animation: 'pulse 4s ease-in-out infinite alternate' }}></div>
        <div style={{ position: 'absolute', bottom: -50, right: -50, width: 300, height: 300, background: 'rgba(0,0,0,0.1)', borderRadius: '50%', filter: 'blur(40px)', animation: 'pulse 6s ease-in-out infinite alternate-reverse' }}></div>

        <div className="login-left-content no-select" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <img src="/logo.png" alt="StudyNote" style={{ width: 120, height: 120, borderRadius: 28, marginBottom: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} />
          <h1 style={{ fontSize: 48, fontWeight: 900, marginBottom: 16, lineHeight: 1.1 }}>Aprende, comparte<br />y conecta.</h1>
          <p style={{ fontSize: 20, opacity: 0.9, maxWidth: 400 }}>La red social educativa donde resolver tus dudas es más fácil que nunca.</p>
        </div>
      </div>

      {/* SECCIÓN DERECHA: Formularios */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 10%',
        background: 'var(--bg-color)'
      }}>
        <div className="login-form-container" style={{ maxWidth: 400, width: '100%' }}>
          {/* Logo superior */}
          <div className="logo login-logo" style={{ marginBottom: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo.png" alt="StudyNote" style={{ width: 32, height: 32, borderRadius: 8 }} />
            <span style={{ fontWeight: 800, fontSize: 22 }}>StudyNote</span>
          </div>

          <div key={isVerifying ? 'verify' : (isRegistering ? 'register' : 'login')} className="form-fade-in">
            {/* Títulos dinámicos según el estado */}
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
              {isVerifying ? 'Verifica tu cuenta' : (isRegistering ? 'Únete hoy mismo.' : 'Bienvenido de nuevo.')}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>
              {isVerifying
                ? `Se ha enviado un código de 6 dígitos a ${pendingEmail}`
                : (isRegistering ? 'Crea una cuenta para empezar a estudiar.' : 'Inicia sesión en tu cuenta.')}
            </p>

            {/* Mensajes de error */}
            {error && (
              <div
                key={error}
                className="error-shake"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid #ef4444',
                  color: '#ef4444',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: 20,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                <div style={{ width: 4, height: 16, background: '#ef4444', borderRadius: 2 }}></div>
                {error}
              </div>
            )}

            {isVerifying ? (
              /* --- VISTA DE VERIFICACIÓN (6 CASILLAS) --- */
              <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 }}>Código de seguridad</label>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                    {verificationCode.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        style={{
                          width: '45px',
                          height: '55px',
                          background: 'var(--bg-card)',
                          border: digit ? '2px solid var(--primary)' : '2px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          textAlign: 'center',
                          fontSize: '24px',
                          fontWeight: '800',
                          color: 'var(--primary)',
                          transition: 'all 0.2s',
                          boxShadow: digit ? '0 5px 15px rgba(79, 70, 229, 0.15)' : 'none',
                          outline: 'none'
                        }}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '16px', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}>
                  Verificar Identidad
                </button>
                <button
                  type="button"
                  onClick={() => setIsVerifying(false)}
                  style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  ← Volver al inicio de sesión
                </button>
              </form>
            ) : (
              /* --- VISTA DE LOGIN / REGISTRO --- */
              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {isRegistering && (
                  <>
                    <input
                      type="text"
                      placeholder="Nombre completo"
                      className="search-input"
                      style={{
                        background: 'var(--bg-card)',
                        padding: '14px 16px',
                        borderRadius: 'var(--radius-sm)',
                        border: `1px solid ${invalidFields.includes('name') ? '#ef4444' : 'var(--border-color)'}`,
                        boxShadow: invalidFields.includes('name') ? '0 0 0 4px rgba(239, 68, 68, 0.1)' : 'none',
                        transition: 'all 0.2s'
                      }}
                      value={name}
                      onChange={(e) => handleInputChange('name', e.target.value, setName)}
                    />
                    <input
                      type="email"
                      placeholder="Correo electrónico"
                      className="search-input"
                      style={{
                        background: 'var(--bg-card)',
                        padding: '14px 16px',
                        borderRadius: 'var(--radius-sm)',
                        border: `1px solid ${invalidFields.includes('email') ? '#ef4444' : 'var(--border-color)'}`,
                        boxShadow: invalidFields.includes('email') ? '0 0 0 4px rgba(239, 68, 68, 0.1)' : 'none',
                        transition: 'all 0.2s'
                      }}
                      value={email}
                      onChange={(e) => handleInputChange('email', e.target.value, setEmail)}
                    />
                  </>
                )}

                <input
                  type="text"
                  placeholder="Usuario o correo"
                  className="search-input"
                  style={{
                    background: 'var(--bg-card)',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${invalidFields.includes('username') ? '#ef4444' : 'var(--border-color)'}`,
                    boxShadow: invalidFields.includes('username') ? '0 0 0 4px rgba(239, 68, 68, 0.1)' : 'none',
                    transition: 'all 0.2s'
                  }}
                  value={username}
                  onChange={(e) => handleInputChange('username', e.target.value, setUsername)}
                />

                <input
                  type="password"
                  placeholder="Contraseña"
                  className="search-input"
                  style={{
                    background: 'var(--bg-card)',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${invalidFields.includes('password') ? '#ef4444' : 'var(--border-color)'}`,
                    boxShadow: invalidFields.includes('password') ? '0 0 0 4px rgba(239, 68, 68, 0.1)' : 'none',
                    transition: 'all 0.2s'
                  }}
                  value={password}
                  onChange={(e) => handleInputChange('password', e.target.value, setPassword)}
                />

                <button type="submit" className="btn-primary" style={{ padding: '14px', justifyContent: 'center', marginTop: 8, fontSize: 16 }}>
                  {isRegistering ? 'Registrarse' : 'Iniciar Sesión'}
                </button>
              </form>
            )}

            {/* Alternancia entre Login y Registro */}
            {!isVerifying && (
              <div style={{ marginTop: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
                {isRegistering ? '¿Ya tienes una cuenta? ' : '¿No tienes cuenta? '}
                <button
                  onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                  style={{ color: 'var(--primary)', fontWeight: 700 }}
                >
                  {isRegistering ? 'Inicia sesión' : 'Regístrate'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
