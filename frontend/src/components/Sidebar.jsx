import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Home, Bookmark, User, Settings, LogOut, Trophy } from 'lucide-react';
import { AuthContext } from '../App';

// Barra lateral de navegación con accesos directos principales
const Sidebar = () => {
  // Obtención del usuario actual y la función de cierre de sesión del contexto global
  const { currentUser, logout } = useContext(AuthContext);

  return (
    <aside className="sidebar">
      {/* Logo de la aplicación con redirección al inicio */}
      <NavLink to="/" className="logo">
        <img src="/logo.png" alt="StudyNote" style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover' }} />
        <span style={{ fontWeight: 800, fontSize: 20 }}>StudyNote</span>
      </NavLink>
      
      {/* Sección de navegación principal */}
      <div className="sidebar-label">Plataforma</div>
      <nav className="nav-menu">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Home size={20} />
          Inicio
        </NavLink>
        <NavLink to="/ranking" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Trophy size={20} />
          Ranking
        </NavLink>
        <NavLink to="/guardados" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Bookmark size={20} />
          Biblioteca
        </NavLink>
      </nav>

      {/* Sección de gestión de cuenta de usuario */}
      <div className="sidebar-label" style={{ marginTop: 32 }}>Tu Cuenta</div>
      <nav className="nav-menu">
        <NavLink to="/ajustes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          Ajustes
        </NavLink>
        {/* Botón de cierre de sesión */}
        <button className="nav-item logout" onClick={logout} style={{ background: 'transparent', border: 'none', width: '100%', justifyContent: 'flex-start', cursor: 'pointer' }}>
          <LogOut size={20} />
          Cerrar sesión
        </button>
      </nav>

      {/* Pie de la barra lateral con información resumida del perfil */}
      <div className="sidebar-footer">
        <NavLink to={`/profile/${currentUser.username}`} className="user-mini-card">
          <img src={currentUser.avatar} alt={currentUser.name} style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--border-color)' }} />
          <div className="user-mini-info">
            <span className="user-mini-name">{currentUser.name}</span>
            <span className="user-mini-handle">@{currentUser.username}</span>
          </div>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
