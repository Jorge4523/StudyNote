import React, { useState, useContext, useEffect, useRef } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Eye, Trash2, Moon, Sun, Lock, CreditCard, X } from 'lucide-react';
import { AuthContext } from '../App';

// Componente para la configuración del perfil y preferencias del estudiante
const Settings = () => {
  // Obtención de datos globales y funciones del contexto de autenticación
  const { currentUser, theme, setTheme, api, updateProfile, setUser } = useContext(AuthContext);
  
  // --- ESTADOS DE LA INTERFAZ ---
  const [activeTab, setActiveTab] = useState('account');      // Gestión de la pestaña activa
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false); // Visibilidad del modal de contraseña
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para la gestión de animaciones de cierre en modales
  const [isClosingPassword, setIsClosingPassword] = useState(false);
  const [isClosingDelete, setIsClosingDelete] = useState(false);

  // Sincronización del título del documento
  useEffect(() => {
    document.title = 'Ajustes | StudyNote';
  }, []);

  // --- LÓGICA DE PREFERENCIAS Y CONTROLES ---
  const [mounted, setMounted] = useState(false);     // Control de montaje inicial para evitar parpadeos
  const [tabChanging, setTabChanging] = useState(false); // Gestión de estados durante la transición de pestañas
  
  // Inicialización de la configuración de notificaciones del usuario
  const [notifSettings, setNotifSettings] = useState(() => {
    const s = currentUser?.notification_settings;
    return {
      likes: s?.likes ?? true,
      followers: s?.followers ?? true,
      replies: s?.replies ?? true
    };
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Gestión de transiciones visuales al cambiar de pestaña
  useEffect(() => {
    setTabChanging(true);
    setError('');
    setSuccess('');
    const timer = setTimeout(() => setTabChanging(false), 150);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Cierre controlado con animación del modal de cambio de contraseña
  const closePasswordPopup = () => {
    setIsClosingPassword(true);
    setTimeout(() => {
      setIsChangePasswordOpen(false);
      setIsClosingPassword(false);
      setError('');
      setSuccess('');
      setPasswordForm({ current: '', new: '', confirm: '' });
    }, 250);
  };

  // Cierre controlado con animación del modal de eliminación de cuenta
  const closeDeletePopup = () => {
    setIsClosingDelete(true);
    setTimeout(() => {
      setIsDeleteAccountOpen(false);
      setIsClosingDelete(false);
      setError('');
      setDeletePassword('');
    }, 250);
  };

  // Procesamiento del cambio de contraseña con validación de seguridad
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones de integridad de datos
    if (!passwordForm.current) {
      setError('Se requiere la contraseña actual para verificar la identidad.');
      return;
    }
    if (passwordForm.new || passwordForm.new.length < 6) {
      setError('La nueva contraseña debe tener una longitud mínima de 6 caracteres.');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setError('La confirmación no coincide con la nueva contraseña.');
      return;
    }

    try {
      await api.post('/user/change-password', {
        user_id: currentUser.id,
        current_password: passwordForm.current,
        new_password: passwordForm.new,
        new_password_confirmation: passwordForm.confirm
      });
      setSuccess('Contraseña actualizada correctamente.');
      // Cierre del modal tras un breve retardo para confirmar el éxito
      setTimeout(closePasswordPopup, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al validar la contraseña actual.');
    }
  };

  const { logout } = useContext(AuthContext);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  // Procedimiento de eliminación irreversible de la cuenta
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!deletePassword) {
      setError('Es obligatorio introducir la contraseña para confirmar la baja.');
      return;
    }

    try {
      await api.post('/user/delete', {
        user_id: currentUser.id,
        current_password: deletePassword
      });
      logout(); // Finalización de sesión tras la eliminación exitosa
    } catch (err) {
      setError(err.response?.data?.message || 'Contraseña incorrecta. No se puede proceder con la eliminación.');
    }
  };

  // Sincronización de preferencias de notificaciones con el servidor
  const handleSaveNotifs = async () => {
    setError('');
    setSuccess('');
    try {
      await updateProfile({ 
        notification_settings: notifSettings 
      });
      setSuccess('Preferencias de notificaciones guardadas');
    } catch (e) {
      setError('Error al guardar las preferencias');
    }
  };

  // Definición de las secciones de navegación lateral
  const tabs = [
    { id: 'account', label: 'Cuenta', icon: SettingsIcon },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'security', label: 'Seguridad', icon: Lock },
  ];

  // Renderizado dinámico según la sección seleccionada
  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="settings-section">
            <h3 className="section-title">Información de la Cuenta</h3>

            {/* Visualización de mensajes de estado */}
            {error && <div style={{ background: '#ef444422', color: '#ef4444', padding: '12px 16px', borderRadius: 8, fontSize: 14, marginBottom: 16 }}>{error}</div>}
            {success && <div style={{ background: '#10b98122', color: '#10b981', padding: '12px 16px', borderRadius: 8, fontSize: 14, marginBottom: 16 }}>{success}</div>}

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Nombre de Usuario</div>
                <div className="setting-desc">@{currentUser.username}</div>
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Email Asociado</div>
                <div className="setting-desc">{currentUser.email}</div>
              </div>
            </div>
            {/* Control de alternancia de tema visual */}
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Tema de la Aplicación</div>
                <div className="setting-desc">Alternar entre los modos claro y oscuro de la interfaz.</div>
              </div>
              <div className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ display: 'flex', background: 'var(--bg-color)', borderRadius: 20, padding: 4, cursor: 'pointer', border: '1px solid var(--border-color)' }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px 14px', 
                  borderRadius: 16, 
                  background: theme === 'light' ? 'var(--primary)' : 'transparent', 
                  color: theme === 'light' ? 'white' : 'var(--text-muted)',
                  transition: 'all 0.2s'
                }}>
                  <Sun size={16} />
                </div>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px 14px', 
                  borderRadius: 16, 
                  background: theme === 'dark' ? 'var(--primary)' : 'transparent', 
                  color: theme === 'dark' ? 'white' : 'var(--text-muted)',
                  transition: 'all 0.2s'
                }}>
                  <Moon size={16} />
                </div>
              </div>
            </div>
          </div>
        );
      case 'notifications':
        if (!currentUser) return <div className="loading-container"><div className="spinner"></div></div>;
        
        return (
          <div className="settings-section">
            <h3 className="section-title">Preferencias de Notificaciones</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>Gestión de alertas para eventos específicos de la plataforma.</p>
            
            {/* Visualización de mensajes de estado */}
            {error && <div style={{ background: '#ef444422', color: '#ef4444', padding: '12px 16px', borderRadius: 8, fontSize: 14, marginBottom: 16 }}>{error}</div>}
            {success && <div style={{ background: '#10b98122', color: '#10b981', padding: '12px 16px', borderRadius: 8, fontSize: 14, marginBottom: 16 }}>{success}</div>}

            {/* Controles de activación/desactivación de alertas */}
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Likes en mis Notes</div>
                <div className="setting-desc">Aviso cuando un aporte reciba una reacción positiva.</div>
              </div>
              <div 
                className={`toggle-switch ${notifSettings.likes ? 'active' : ''} ${(!mounted || tabChanging) ? 'no-animate' : ''}`}
                onClick={() => setNotifSettings({...notifSettings, likes: !notifSettings.likes})}
              >
                <div className="toggle-switch-dot" />
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Nuevos seguidores</div>
                <div className="setting-desc">Aviso al recibir una nueva solicitud de seguimiento.</div>
              </div>
              <div 
                className={`toggle-switch ${notifSettings.followers ? 'active' : ''} ${(!mounted || tabChanging) ? 'no-animate' : ''}`}
                onClick={() => setNotifSettings({...notifSettings, followers: !notifSettings.followers})}
              >
                <div className="toggle-switch-dot" />
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Respuestas</div>
                <div className="setting-desc">Aviso cuando se publiquen comentarios en los Notes propios.</div>
              </div>
              <div 
                className={`toggle-switch ${notifSettings.replies ? 'active' : ''} ${(!mounted || tabChanging) ? 'no-animate' : ''}`}
                onClick={() => setNotifSettings({...notifSettings, replies: !notifSettings.replies})}
              >
                <div className="toggle-switch-dot" />
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <button className="btn-primary" onClick={handleSaveNotifs}>Guardar Preferencias</button>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="settings-section">
            <h3 className="section-title">Seguridad</h3>
            <div className="setting-item" style={{ paddingBottom: 16, border: 'none' }}>
              <div className="setting-info">
                <div className="setting-label">Contraseña</div>
                <div className="setting-desc">Actualización periódica de la clave de acceso.</div>
              </div>
              <button className="btn-secondary" onClick={() => setIsChangePasswordOpen(true)}>Actualizar</button>
            </div>
            {/* Sección de acciones críticas: Eliminación de cuenta */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="setting-info">
                <div className="setting-label" style={{ color: '#ef4444' }}>Zona Crítica</div>
                <div className="setting-desc">Eliminación permanente de la cuenta y sus datos asociados en StudyNote.</div>
              </div>
              <button className="btn-secondary" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => setIsDeleteAccountOpen(true)}><Trash2 size={16} /> Eliminar Cuenta</button>
            </div>
          </div>
        );
      default:
        return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Sección en desarrollo...</div>;
    }
  };

  return (
    <div className="settings-container">
      <div className="page-header" style={{ marginBottom: 32 }}>
        <h1 className="page-title">Configuración del Perfil</h1>
      </div>

      <div className={`settings-layout ${(!mounted || tabChanging) ? 'no-animate' : ''}`}>
        {/* Navegación lateral de configuración */}
        <aside className="settings-nav">
          {tabs.map(tab => (
            <button 
              key={tab.id} 
              className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Panel principal de contenido */}
        <main className="settings-content">
          <div className="settings-card">
            {renderTabContent()}
          </div>
        </main>
      </div>

      {/* --- COMPONENTES MODALES --- */}

      {/* Modal: Cambio de contraseña */}
      {isChangePasswordOpen && (
        <div className={`popup-overlay ${isClosingPassword ? 'closing' : ''}`} onClick={(e) => { if (e.target.classList.contains('popup-overlay')) closePasswordPopup(); }}>
          <div className={`popup-content ${isClosingPassword ? 'closing' : ''}`} style={{ maxWidth: 450 }}>
            <div className="popup-header">
              <h2 style={{ fontSize: 20, fontWeight: 800 }}>Cambiar Contraseña</h2>
              <button onClick={closePasswordPopup} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', borderRadius: '50%', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleChangePassword} noValidate className="popup-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {error && <div style={{ background: '#ef444422', color: '#ef4444', padding: '12px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>{error}</div>}
              {success && <div style={{ background: '#10b98122', color: '#10b981', padding: '12px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>{success}</div>}
              
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--text-muted)' }}>CONTRASEÑA ACTUAL</label>
                <input type="password" className="search-input" value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', width: '100%', padding: '12px 16px', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--text-muted)' }}>NUEVA CONTRASEÑA</label>
                <input type="password" className="search-input" value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', width: '100%', padding: '12px 16px', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--text-muted)' }}>CONFIRMAR NUEVA CONTRASEÑA</label>
                <input type="password" className="search-input" value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', width: '100%', padding: '12px 16px', outline: 'none' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                <button type="button" className="btn-secondary" onClick={closePasswordPopup}>Cancelar</button>
                <button type="submit" className="btn-primary">Actualizar Contraseña</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Eliminación definitiva de cuenta */}
      {isDeleteAccountOpen && (
        <div className={`popup-overlay ${isClosingDelete ? 'closing' : ''}`} onClick={(e) => { if (e.target.classList.contains('popup-overlay')) closeDeletePopup(); }}>
          <div className={`popup-content ${isClosingDelete ? 'closing' : ''}`} style={{ maxWidth: 450 }}>
            <div className="popup-header">
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#ef4444' }}>Eliminar Cuenta</h2>
              <button onClick={closeDeletePopup} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', borderRadius: '50%', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleDeleteAccount} noValidate className="popup-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ background: '#ef444411', border: '1px solid #ef444433', color: '#ef4444', padding: 16, borderRadius: 8, fontSize: 14 }}>
                <b>Advertencia:</b> Esta acción es definitiva. Se procederá a la eliminación de todos los aportes, reacciones y conexiones. No existe posibilidad de recuperación.
              </div>

              {error && <div style={{ background: '#ef444422', color: '#ef4444', padding: '12px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>{error}</div>}
              
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--text-muted)' }}>CONFIRMACIÓN DE CONTRASEÑA</label>
                <input type="password" className="search-input" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} placeholder="Contraseña actual" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', width: '100%', padding: '12px 16px', outline: 'none' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                <button type="button" className="btn-secondary" onClick={closeDeletePopup}>Cancelar operación</button>
                <button type="submit" className="btn-primary" style={{ background: '#ef4444' }}>Eliminar permanentemente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
