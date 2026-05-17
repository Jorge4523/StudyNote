import React, { useState, useContext, useEffect } from 'react';
import { MessageSquare, Bookmark, Heart, Trash2 } from 'lucide-react';
import { AuthContext } from '../App';
import { Link } from 'react-router-dom';

// Componente de tarjeta para visualizar cada Note individual en el feed
const Note = ({ note, onClick }) => {
  // Datos y funciones globales obtenidos del contexto de autenticación
  const { currentUser, api, refreshNotes, handleFollow, deleteNote } = useContext(AuthContext);

  // Estado para gestionar el estilo visual del botón de seguimiento al pasar el cursor
  const [isHoveringFollow, setIsHoveringFollow] = useState(false);

  // Verificación de si el usuario actual sigue al autor del Note
  const isFollowing = currentUser.following_ids?.some(id => Number(id) === Number(note.author.id));

  // Gestión del seguimiento del autor (stopPropagation evita abrir el detalle del Note)
  const onFollowClick = (e) => {
    e.stopPropagation();
    handleFollow(note.author.id);
  };

  // Estados para la confirmación de eliminación
  const [showConfirm, setShowConfirm] = useState(false);

  // Apertura del diálogo de confirmación
  const onDeleteClick = (e) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  // Ejecución de la eliminación permanente
  const confirmDelete = (e) => {
    e.stopPropagation();
    deleteNote(note.id);
    setShowConfirm(false);
  };

  // Cancelación del proceso de borrado
  const cancelDelete = (e) => {
    e.stopPropagation();
    setShowConfirm(false);
  };

  // Estados locales para actualización optimista de la interfaz (Optimistic UI)
  const [isSaved, setIsSaved] = useState(() => note.saves?.includes(currentUser?.id));
  const [isLiked, setIsLiked] = useState(() => note.likes?.includes(currentUser?.id));
  const [likesCount, setLikesCount] = useState(() => note.likes?.length || 0);

  // Estados para el control de animaciones interactivas
  const [likeAnim, setLikeAnim] = useState(false);
  const [saveAnim, setSaveAnim] = useState(false);

  // Sincronización de estados locales ante cambios externos en las props
  useEffect(() => {
    setIsSaved(note.saves?.includes(currentUser?.id));
    setIsLiked(note.likes?.includes(currentUser?.id));
    setLikesCount(note.likes?.length || 0);
  }, [note, currentUser]);

  // Gestión del guardado en la biblioteca personal
  const handleSave = async (e) => {
    e.stopPropagation();
    if (!currentUser) return;

    // Activación de la animación de rebote si se guarda por primera vez
    if (!isSaved) {
      setSaveAnim(true);
      setTimeout(() => setSaveAnim(false), 500);
    }

    setIsSaved(!isSaved); // Actualización instantánea de la UI
    try {
      await api.post('/saves', { user_id: currentUser.id, note_id: note.id });
      refreshNotes(); // Sincronización con los datos reales del servidor
    } catch (err) {
      setIsSaved(!isSaved); // Reversión en caso de error
    }
  };

  // Gestión de "Me gusta" (Likes)
  const handleLike = async (e) => {
    e.stopPropagation();
    if (!currentUser) return;

    // Activación de la animación de explosión y brillo
    if (!isLiked) {
      setLikeAnim(true);
      setTimeout(() => setLikeAnim(false), 600);
    }

    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    try {
      await api.post('/likes', { user_id: currentUser.id, note_id: note.id });
      refreshNotes();
    } catch (err) {
      setIsLiked(!isLiked);
      setLikesCount(prev => !isLiked ? prev - 1 : prev + 1);
    }
  };

  // Formateo relativo de la fecha de publicación
  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60); // Diferencia en minutos
    if (diff < 60) return `Hace ${diff} min`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `Hace ${hours} h`;
    return `Hace ${Math.floor(hours / 24)} d`;
  };

  // Asignación de colores representativos por tema de estudio
  const getTopicColor = (topic) => {
    const colors = {
      'Fisica': '#3b82f6',
      'Programacion': '#10b981',
      'Historia': '#f59e0b',
      'Matematicas': '#8b5cf6',
      'Quimica': '#ec4899',
      'Biologia': '#14b8a6'
    };
    return colors[topic] || 'var(--primary)';
  };

  return (
    <div className="study-card" onClick={() => onClick(note)} style={{ '--primary': getTopicColor(note.topic), position: 'relative' }}>
      {/* Capa de confirmación de eliminación (Overlay) */}
      {showConfirm && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 100,
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 20,
          backdropFilter: 'blur(4px)'
        }}>
          <p style={{ color: 'white', fontWeight: 700, textAlign: 'center', fontSize: 14 }}>¿Eliminar este Note permanentemente?</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={confirmDelete}
              style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
            >
              Sí, borrar
            </button>
            <button
              onClick={cancelDelete}
              style={{ background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '8px 16px', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Cabecera: Información del autor */}
      <div className="card-header">
        <div className="card-author-info">
          <Link to={`/profile/${note.author.username}`}>
            <img src={note.author.avatar} alt={note.author.name} className="avatar" />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link to={`/profile/${note.author.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <span className="card-author-name">{note.author.name}</span>
              </Link>
              <span style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>
                {note.author.username.startsWith('@') ? note.author.username : `@${note.author.username}`}
              </span>
              {/* Botón de seguimiento (oculto si el autor es el usuario actual) */}
              {note.author.username !== currentUser.username && (
                <button
                  className={`follow-btn-hover ${isFollowing ? 'following' : ''}`}
                  onClick={onFollowClick}
                  onMouseEnter={() => setIsHoveringFollow(true)}
                  onMouseLeave={() => setIsHoveringFollow(false)}
                >
                  {isFollowing ? (isHoveringFollow ? 'Dejar de seguir' : 'Siguiendo') : 'Seguir'}
                </button>
              )}
            </div>
            <span className="card-time">{timeAgo(note.createdAt)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Opción de eliminación solo disponible para el autor */}
          {Number(note.author.id) === Number(currentUser.id) && (
            <button
              onClick={onDeleteClick}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center', transition: 'color 0.2s', zIndex: 10, position: 'relative' }}
              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              title="Eliminar Note"
            >
              <Trash2 size={18} />
            </button>
          )}
          {/* Etiqueta de tema con color dinámico */}
          <span className="card-topic-tag" style={{ color: getTopicColor(note.topic), background: `${getTopicColor(note.topic)}15` }}>
            {note.topic}
          </span>
        </div>
      </div>

      {/* Contenido: Texto y adjuntos opcionales */}
      <div className="card-content">
        <p style={{ marginBottom: note.image ? 16 : 0 }}>{note.content}</p>
        {note.image && (
          <img
            src={note.image}
            alt="Note attachment"
            style={{
              width: '100%',
              borderRadius: 12,
              border: '1px solid var(--border-color)',
              marginTop: 12,
              maxHeight: 400,
              objectFit: 'cover'
            }}
          />
        )}
      </div>

      {/* Pie de tarjeta: Estadísticas y acciones interactivas */}
      <div className="card-footer">
        <button className="card-stat">
          <MessageSquare size={16} />
          {note.repliesCount || 0} Respuestas
        </button>
        <div style={{ display: 'flex', gap: 16 }}>
          {/* Botón de guardado (Bookmark) */}
          <button className={`card-stat ${isSaved ? 'saved' : ''}`} onClick={handleSave}>
            <Bookmark
              size={18}
              fill={isSaved ? "currentColor" : "none"}
              className={saveAnim ? 'anim-bounce' : ''}
            />
          </button>
          {/* Botón de Like con contador dinámico */}
          <button className="card-stat" onClick={handleLike} style={{ color: isLiked ? '#ef4444' : '' }}>
            <Heart
              size={18}
              fill={isLiked ? '#ef4444' : 'none'}
              className={likeAnim ? 'anim-pop anim-glow' : ''}
            />
            <span style={{ fontSize: 13, marginLeft: 4 }}>{likesCount > 0 ? likesCount : ''}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Note;
