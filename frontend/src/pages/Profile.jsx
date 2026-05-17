import React, { useState, useContext, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Note from '../components/Note';
import NotePopup from '../components/NotePopup';
import { Calendar, MapPin, Link as LinkIcon, Edit3, X, Save, Star, Shield, GraduationCap } from 'lucide-react';
import { AuthContext } from '../App';
import { TOPICS } from '../constants';

// Componente para visualizar el perfil de un estudiante
const Profile = ({ notes }) => {
  // Extracción del nombre de usuario de los parámetros de la URL
  const { username } = useParams();
  
  // Datos y funciones globales obtenidos del contexto de autenticación
  const { currentUser, updateProfile, api, handleFollow } = useContext(AuthContext);
  
  // Estados para la gestión de pestañas y visualización de datos
  const [activeTab, setActiveTab] = useState('notes');
  const [selectedNote, setSelectedNote] = useState(null);
  const [displayedUser, setDisplayedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  
  // Referencias para la animación del indicador de pestañas
  const notesTabRef = useRef(null);
  const likesTabRef = useRef(null);
  
  // Estados para el formulario de edición de perfil
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editSkills, setEditSkills] = useState([]);
  const [editAvatar, setEditAvatar] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editEducation, setEditEducation] = useState('');
  const [isPopping, setIsPopping] = useState(false);

  // Opciones de avatares disponibles para personalización
  const avatarOptions = ['Felix', 'Aneka', 'Oliver', 'Mimi', 'Jasper', 'Sasha', 'Leo', 'Mia'];

  // Sincronización del título del documento con el perfil visualizado
  useEffect(() => {
    if (displayedUser) {
      document.title = `${displayedUser.name} (@${displayedUser.username}) | StudyNote`;
    } else {
      document.title = 'Perfil | StudyNote';
    }
  }, [displayedUser]);

  // Carga de los datos del usuario desde el servidor
  useEffect(() => {
    const fetchUser = async () => {
      if (!displayedUser) setLoading(true);
      try {
        // Carga de datos propios o de otro usuario según la ruta
        if (!username || username === currentUser.username) {
          setDisplayedUser(currentUser);
          setEditName(currentUser.name);
          setEditBio(currentUser.bio);
          setEditWebsite(currentUser.website || '');
          setEditSkills(currentUser.skills || []);
          setEditAvatar(currentUser.avatar);
          setEditLocation(currentUser.location || '');
          setEditEducation(currentUser.education_center || '');
        } else {
          // Petición al servidor para obtener datos de un tercero
          const res = await api.get(`/users/${username}`);
          setDisplayedUser(res.data);
        }
      } catch (err) {
        console.error("No se ha podido localizar al usuario", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [username, api, currentUser]);

  // Gestión de la posición y ancho del indicador de la pestaña activa
  useEffect(() => {
    const activeRef = activeTab === 'notes' ? notesTabRef : likesTabRef;
    if (activeRef.current) {
      setIndicatorStyle({
        left: activeRef.current.offsetLeft,
        width: activeRef.current.offsetWidth
      });
    }
  }, [activeTab, loading, displayedUser]);

  // Vista de carga inicial del perfil
  if (loading) return (
    <div className="loading-container" style={{ minHeight: '50vh' }}>
      <div className="spinner"></div>
      <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>Cargando perfil...</span>
    </div>
  );
  
  // Vista de error si el usuario no existe
  if (!displayedUser) return (
    <div className="loading-container" style={{ minHeight: '50vh' }}>
      <span style={{ fontSize: 16, fontWeight: 700 }}>Usuario no encontrado</span>
      <button className="btn-secondary" onClick={() => window.history.back()} style={{ marginTop: 12 }}>Volver atrás</button>
    </div>
  );

  const isMyProfile = displayedUser.id === currentUser.id;

  // Restricción visual para perfiles privados
  if (displayedUser.is_private && !isMyProfile) {
    return (
      <div className="profile-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 24 }}>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: 32, borderRadius: '50%', color: '#ef4444' }}>
          <Shield size={64} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Perfil Privado</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 18 }}>Este estudiante ha decidido mantener sus Notes y actividad en privado.</p>
        </div>
        <button className="btn-secondary" onClick={() => window.history.back()}>Volver atrás</button>
      </div>
    );
  }

  // Filtrado de aportes del usuario (propios y gustados)
  const userNotes = notes.filter(n => n.author.username === displayedUser.username);
  const likedNotes = notes.filter(n => n.likes?.includes(displayedUser.id));
  
  // Persistencia de los cambios en el perfil del usuario
  const handleSaveProfile = async () => {
    const updatedData = { 
      name: editName, 
      bio: editBio, 
      avatar: editAvatar,
      location: editLocation,
      education_center: editEducation,
      website: editWebsite, 
      skills: editSkills 
    };
    await updateProfile(updatedData);
    setDisplayedUser(prev => ({ ...prev, ...updatedData }));
    setIsEditing(false);
    
    // Ejecución de animación visual tras guardar
    setIsPopping(true);
    setTimeout(() => setIsPopping(false), 600);
  };

  // Gestión de la lista de habilidades (skills) del estudiante
  const toggleSkill = (skill) => {
    setEditSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill) 
        : [...prev, skill]
    );
  };

  // Renderizado dinámico de los listados según la pestaña activa
  const renderContent = () => {
    if (activeTab === 'notes') {
      return userNotes.length > 0 ? (
        <div className="notes-grid">
          {userNotes.map(note => (
            <Note key={note.id} note={note} onClick={setSelectedNote} />
          ))}
        </div>
      ) : (
        <div style={{ padding: 60, textAlign: 'center', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px dashed var(--border-color)' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Aún no hay aportes</h3>
          <p style={{ color: 'var(--text-muted)' }}>Este estudiante no ha compartido Notes todavía.</p>
        </div>
      );
    }
    
    if (activeTab === 'likes') {
      return likedNotes.length > 0 ? (
        <div className="notes-grid">
          {likedNotes.map(note => (
            <Note key={note.id} note={note} onClick={setSelectedNote} />
          ))}
        </div>
      ) : (
        <div style={{ padding: 60, textAlign: 'center', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px dashed var(--border-color)' }}>
          <p style={{ color: 'var(--text-muted)' }}>Este estudiante no ha dado "Me gusta" a ningún Note.</p>
        </div>
      );
    }
  };

  return (
    <>
      {/* Título y cabecera de la sección */}
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <h1 className="page-title">{isMyProfile ? 'Mi Perfil de Estudiante' : `Perfil de ${displayedUser.name}`}</h1>
        </div>
      </div>

      <div className="profile-container">
        {/* Panel lateral: Información personal y estadísticas */}
        <aside className="profile-sidebar">
          <img 
            src={displayedUser.avatar} 
            alt={displayedUser.name} 
            className={`profile-avatar-large ${isPopping ? 'pop-animation' : ''}`} 
          />
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>{displayedUser.name}</h2>
          <div style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
            {displayedUser.username.startsWith('@') ? displayedUser.username : `@${displayedUser.username}`}
          </div>
          
          {/* Acción principal: Editar (si es propio) o Seguir (si es ajeno) */}
          {isMyProfile ? (
            <button 
              className="btn-secondary" 
              style={{ width: '100%', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              onClick={() => setIsEditing(true)}
            >
              <Edit3 size={16} /> Editar Perfil
            </button>
          ) : (
            <button 
              className={`btn-${currentUser.following_ids?.some(id => Number(id) === Number(displayedUser.id)) ? 'secondary' : 'primary'}`} 
              style={{ 
                width: '100%', 
                marginBottom: 24, 
                fontWeight: 700,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: currentUser.following_ids?.some(id => Number(id) === Number(displayedUser.id)) && isHovering ? '#ef4444' : '',
                borderColor: currentUser.following_ids?.some(id => Number(id) === Number(displayedUser.id)) && isHovering ? '#ef4444' : '',
                color: currentUser.following_ids?.some(id => Number(id) === Number(displayedUser.id)) && isHovering ? 'white' : ''
              }}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onClick={async () => {
                const status = await handleFollow(displayedUser.id);
                setDisplayedUser(prev => ({
                  ...prev,
                  followers: status === 'followed' ? (Number(prev.followers) + 1) : Math.max(0, Number(prev.followers) - 1)
                }));
              }}
            >
              {currentUser.following_ids?.some(id => Number(id) === Number(displayedUser.id)) 
                ? (isHovering ? 'Dejar de seguir' : 'Siguiendo') 
                : 'Seguir Estudiante'}
            </button>
          )}

          <p style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
            {displayedUser.bio || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin descripción...</span>}
          </p>
          
          {/* Panel de métricas sociales */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 24, padding: '16px 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-main)' }}>{displayedUser.followers}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Seguidores</div>
            </div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-main)' }}>{displayedUser.following}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Siguiendo</div>
            </div>
          </div>

          {/* Medidor de puntos de ayuda (Karma) */}
          <div style={{ background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(16, 185, 129, 0.1))', padding: 16, borderRadius: 'var(--radius-sm)', marginBottom: 24, border: '1px solid rgba(79, 70, 229, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--secondary)', fontWeight: 800, fontSize: 20 }}>
              <Star size={20} fill="var(--secondary)" /> {displayedUser.help_points || 0}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginTop: 4 }}>Puntos de Ayuda</div>
          </div>

          {/* Metadatos adicionales del perfil */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, color: 'var(--text-muted)', fontSize: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={18} color="var(--primary)" /> 
              {displayedUser.location || <span style={{ fontStyle: 'italic' }}>Ubicación desconocida</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <GraduationCap size={18} color="var(--primary)" /> 
              {displayedUser.education_center || <span style={{ fontStyle: 'italic' }}>Centro educativo no especificado</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <LinkIcon size={18} color="var(--primary)" /> 
              {displayedUser.website ? (
                <a href={displayedUser.website.startsWith('http') ? displayedUser.website : `https://${displayedUser.website}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-main)' }}>
                  {displayedUser.website.replace(/^https?:\/\//, '')}
                </a>
              ) : (
                <span style={{ fontStyle: 'italic' }}>Sin enlace...</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={18} color="var(--primary)" /> Se unió el {new Date(displayedUser.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </div>
          </div>

          {/* Listado de habilidades destacadas */}
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, letterSpacing: 0.5 }}>HABILIDADES</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(displayedUser.skills || []).map(skill => (
                <span key={skill} style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 600 }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </aside>

        {/* Panel central: Feed de actividades y aportes */}
        <div className="profile-content">
          <div className="tabs-header">
            <button 
              ref={notesTabRef}
              className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`} 
              onClick={() => setActiveTab('notes')}
            >
              Notes ({userNotes.length})
            </button>
            <button 
              ref={likesTabRef}
              className={`tab-btn ${activeTab === 'likes' ? 'active' : ''}`} 
              onClick={() => setActiveTab('likes')}
            >
              Me gusta ({likedNotes.length})
            </button>
            <div className="tab-indicator" style={indicatorStyle} />
          </div>
          {renderContent()}
        </div>
      </div>

      {/* Ventana modal de edición de perfil */}
      {isEditing && (
        <div className="popup-overlay" onClick={() => setIsEditing(false)}>
          <div className="popup-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="popup-header">
              <h2 style={{ fontSize: 20, fontWeight: 800 }}>Editar Perfil</h2>
              <button onClick={() => setIsEditing(false)} style={{ padding: 6, background: 'var(--bg-color)', borderRadius: '50%', border: '1px solid var(--border-color)' }}>
                <X size={20} />
              </button>
            </div>
            <div className="popup-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 12, color: 'var(--text-muted)' }}>ELIGE TU AVATAR</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
                  {avatarOptions.map(seed => {
                    const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                    return (
                      <div key={seed} onClick={() => setEditAvatar(url)} style={{ cursor: 'pointer', padding: 4, borderRadius: 'var(--radius)', border: `2px solid ${editAvatar === url ? 'var(--primary)' : 'transparent'}`, background: editAvatar === url ? 'rgba(79, 70, 229, 0.1)' : 'transparent', transition: 'all 0.2s' }}>
                        <img src={url} alt={seed} style={{ width: '100%', borderRadius: 'var(--radius-sm)' }} />
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--text-muted)' }}>NOMBRE</label>
                <input type="text" className="search-input" value={editName} onChange={e => setEditName(e.target.value)} style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', width: '100%', padding: '12px 16px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--text-muted)' }}>LOCALIZACIÓN</label>
                <input type="text" className="search-input" value={editLocation} onChange={e => setEditLocation(e.target.value)} placeholder="Ej: Madrid, España" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', width: '100%', padding: '12px 16px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--text-muted)' }}>CENTRO EDUCATIVO</label>
                <input type="text" className="search-input" value={editEducation} onChange={e => setEditEducation(e.target.value)} placeholder="Ej: Universidad Complutense" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', width: '100%', padding: '12px 16px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--text-muted)' }}>BIOGRAFÍA</label>
                <textarea className="creator-textarea" value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="Cuéntanos un poco sobre ti..." style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', minHeight: 80, padding: 16 }}></textarea>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--text-muted)' }}>ENLACE / SITIO WEB</label>
                <input type="text" className="search-input" value={editWebsite} onChange={e => setEditWebsite(e.target.value)} placeholder="" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', width: '100%', padding: '12px 16px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 12, color: 'var(--text-muted)' }}>HABILIDADES</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {TOPICS.filter(t => t !== 'Todos').map(topic => (
                    <button key={topic} type="button" onClick={() => toggleSkill(topic)} className={`filter-chip ${editSkills.includes(topic) ? 'active' : ''}`} style={{ padding: '8px 16px', fontSize: 13, borderRadius: 'var(--radius-sm)', transition: 'all 0.2s' }}>{topic}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                <button className="btn-secondary" onClick={() => setIsEditing(false)}>Cancelar</button>
                <button className="btn-primary" onClick={handleSaveProfile}><Save size={16} /> Guardar Cambios</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detalle de nota en popup tras selección */}
      {selectedNote && <NotePopup note={selectedNote} onClose={() => setSelectedNote(null)} />}
    </>
  );
};

export default Profile;
