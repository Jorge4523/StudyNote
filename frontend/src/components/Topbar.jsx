import React, { useContext, useState, useEffect, useRef } from 'react';
import { Search, Bell, Plus, Heart, UserPlus, MessageCircle, X } from 'lucide-react';
import { AuthContext } from '../App';
import { Link } from 'react-router-dom';

// Barra superior para gestión de búsquedas y notificaciones
const Topbar = () => {
  // Obtención de datos y funciones globales del contexto de autenticación
  const { currentUser, searchQuery, setSearchQuery, setIsCreateNoteOpen, notifications, markNotificationsRead, notes, setSelectedNote, api } = useContext(AuthContext);
  
  // Estados para controlar la visibilidad de desplegables y resultados
  const [showNotifications, setShowNotifications] = useState(false);
  const [isClosingNotif, setIsClosingNotif] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [results, setResults] = useState({ notes: [], users: [], replies: [] });
  
  // Referencias para la detección de clics externos
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Conteo de notificaciones pendientes de lectura
  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  // Lógica de búsqueda con técnica de "debouncing" para optimizar peticiones
  useEffect(() => {
    const fetchResults = async () => {
      // Búsqueda activada a partir de dos caracteres
      if (searchQuery.trim().length > 1) {
        try {
          const res = await api.get(`/search?q=${searchQuery}`);
          setResults(res.data);
          setShowSearchResults(true);
        } catch (e) {
          console.error("Error en la búsqueda", e);
        }
      } else {
        setResults({ notes: [], users: [], replies: [] });
      }
    };

    // Retraso de 300ms antes de ejecutar la petición
    const timeout = setTimeout(fetchResults, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, api]);

  // Cierre automático de desplegables al hacer clic fuera de ellos
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (showNotifications) {
          setIsClosingNotif(true);
          setTimeout(() => {
            setShowNotifications(false);
            setIsClosingNotif(false);
          }, 200);
        }
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  // Gestión del evento de clic en el icono de notificaciones
  const handleBellClick = () => {
    if (showNotifications) {
      // Cierre con animación si ya estaba abierto
      setIsClosingNotif(true);
      setTimeout(() => {
        setShowNotifications(false);
        setIsClosingNotif(false);
      }, 200);
    } else {
      // Apertura y marcado como leído si existen notificaciones nuevas
      if (unreadCount > 0) markNotificationsRead();
      setShowNotifications(true);
    }
  };

  // Gestión de selección de resultados de búsqueda
  const handleResultClick = (type, item) => {
    if (type === 'user') {
      // Redirección al perfil del usuario
      window.location.href = `/profile/${item.username}`;
    } else if (type === 'note') {
      // Apertura de la nota seleccionada en detalle
      setSelectedNote(item);
    } else if (type === 'reply') {
      // Localización y apertura de la nota padre de la respuesta
      const parentNote = notes.find(n => n.id === item.note_id);
      if (parentNote) setSelectedNote(parentNote);
    }
    // Reseteo del buscador tras la selección
    setSearchQuery('');
    setShowSearchResults(false);
  };

  // Selección de icono representativo según el tipo de notificación
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return <Heart size={16} fill="#ef4444" color="#ef4444" />;
      case 'follow': return <UserPlus size={16} color="var(--primary)" />;
      case 'reply': return <MessageCircle size={16} color="var(--secondary)" />;
      default: return <Bell size={16} />;
    }
  };

  // Generación dinámica de texto descriptivo para notificaciones
  const getNotificationText = (notification) => {
    const actorName = notification.actor?.name || 'Alguien';
    switch (notification.type) {
      case 'like': return <span><b>{actorName}</b> le dio like a tu Note</span>;
      case 'follow': return <span><b>{actorName}</b> comenzó a seguirte</span>;
      case 'reply': return <span><b>{actorName}</b> respondió a tu Note</span>;
      default: return 'Nueva notificación';
    }
  };

  return (
    <header className="topbar">
      {/* Contenedor del buscador con autocompletado */}
      <div className="search-box-container" ref={searchRef}>
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Buscar Notes, temas o estudiantes..." 
            className="search-input" 
            value={searchQuery || ''}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
          />
          {/* Opción para limpiar el campo de búsqueda */}
          {searchQuery && (
            <button 
              className="search-clear-btn"
              onClick={() => {
                setSearchQuery('');
                setShowSearchResults(false);
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Listado desplegable de resultados de búsqueda */}
        {showSearchResults && (results.notes.length > 0 || results.users.length > 0 || results.replies.length > 0) && (
          <div className="search-results-dropdown">
            {/* Resultados de estudiantes */}
            {results.users.length > 0 && (
              <>
                <div className="search-category-header">ESTUDIANTES</div>
                {results.users.map(user => (
                  <div key={user.id} className="search-result-item" onClick={() => handleResultClick('user', user)}>
                    <img src={user.avatar} alt="" className="result-avatar" />
                    <div className="result-info">
                      <div className="result-topic">{user.name}</div>
                      <div className="result-snippet">@{user.username}</div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Resultados de Notes */}
            {results.notes.length > 0 && (
              <>
                <div className="search-category-header">NOTES</div>
                {results.notes.map(note => (
                  <div key={note.id} className="search-result-item" onClick={() => handleResultClick('note', note)}>
                    <div className="result-icon"><Plus size={16} color="var(--primary)" /></div>
                    <div className="result-info">
                      <div className="result-topic">{note.topic}</div>
                      <div className="result-snippet">"{note.content.substring(0, 60)}..."</div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Resultados de respuestas */}
            {results.replies.length > 0 && (
              <>
                <div className="search-category-header">RESPUESTAS</div>
                {results.replies.map(reply => (
                  <div key={reply.id} className="search-result-item" onClick={() => handleResultClick('reply', reply)}>
                    <div className="result-icon"><MessageCircle size={16} color="var(--secondary)" /></div>
                    <div className="result-info">
                      <div className="result-topic">En: {reply.note?.topic}</div>
                      <div className="result-snippet">"{reply.content.substring(0, 40)}..."</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <div className="topbar-actions">
        {/* Gestión de notificaciones */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button 
            className="btn-secondary" 
            style={{ border: 'none', position: 'relative' }}
            onClick={handleBellClick}
          >
            <Bell size={20} />
            {/* Indicador de notificaciones no leídas */}
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {/* Menú desplegable de notificaciones */}
          {(showNotifications || isClosingNotif) && (
            <div className={`notifications-dropdown ${isClosingNotif ? 'closing' : ''}`}>
              <div className="notifications-header">
                <h3>Notificaciones</h3>
                {notifications.length > 0 && <span onClick={markNotificationsRead} style={{ cursor: 'pointer', color: 'var(--primary)', fontSize: 12 }}>Marcar todas como leídas</span>}
              </div>
              <div className="notifications-list">
                {notifications.length === 0 ? (
                  <div className="no-notifications">
                    <Bell size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                    <p>No tienes notificaciones aún</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`notification-item ${!n.is_read ? 'unread' : ''}`}>
                      <div className="notification-icon-wrapper">
                        {getNotificationIcon(n.type)}
                      </div>
                      <div className="notification-content">
                        <p>{getNotificationText(n)}</p>
                        <span className="notification-time">
                          {new Date(n.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Acceso directo para la creación de un nuevo Note */}
        <button className="btn-primary" onClick={() => setIsCreateNoteOpen(true)}>
          <Plus size={18} />
          Nuevo Note
        </button>
      </div>
    </header>
  );
};

export default Topbar;
