import React, { useState, useContext, useEffect } from 'react';
import { X, ArrowUp, ArrowDown, Award, Send } from 'lucide-react';
import Note from './Note';
import { AuthContext } from '../App';
import { Link } from 'react-router-dom';

// Componente para el botón de seguimiento en el listado de respuestas
const FollowButton = ({ userId, username }) => {
  const { currentUser, handleFollow } = useContext(AuthContext);
  const [isHovering, setIsHovering] = useState(false);

  // Restricción para evitar que un usuario se siga a sí mismo
  if (username === currentUser.username) return null;
  
  // Verificación del estado de seguimiento actual
  const isFollowing = currentUser.following_ids?.some(id => Number(id) === Number(userId));

  return (
    <button 
      className={`follow-btn-hover ${isFollowing ? 'following' : ''}`}
      onClick={(e) => { e.stopPropagation(); handleFollow(userId); }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {isFollowing ? (isHovering ? 'Dejar de seguir' : 'Siguiendo') : 'Seguir'}
    </button>
  );
};

// Componente principal para la visualización detallada de un Note en modal
const NotePopup = ({ note, onClose }) => {
  // Acceso a herramientas y funciones globales del contexto
  const { currentUser, api, refreshNotes } = useContext(AuthContext);
  
  // Estados para la gestión del contenido, animaciones y listado de aportes
  const [replyContent, setReplyContent] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [replies, setReplies] = useState(() => {
    // Ordenación inicial de respuestas por popularidad (votos)
    const sorted = [...(note.replies || [])].sort((a, b) => b.upvotes - a.upvotes);
    return sorted;
  });

  // Ejecución de cierre con transición animada
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  // Restricción del desplazamiento del fondo (scroll lock) mientras el modal permanece activo
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Implementación de polling para la actualización periódica de respuestas
  useEffect(() => {
    const fetchLatestReplies = async () => {
      try {
        const res = await api.get(`/notes/${note.id}`);
        const sorted = [...(res.data.replies || [])].sort((a, b) => b.upvotes - a.upvotes);
        setReplies(sorted);
      } catch (e) {
        console.error("Error al actualizar el listado de respuestas", e);
      }
    };

    const interval = setInterval(fetchLatestReplies, 2000);
    return () => clearInterval(interval);
  }, [note.id, api]);

  if (!note) return null;

  // Gestión del cierre al detectar clics en el fondo (backdrop)
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Procedimiento de publicación de una nueva respuesta
  const submitReply = async () => {
    if (!replyContent.trim()) return;
    try {
      const res = await api.post('/replies', { 
        user_id: currentUser.id, 
        note_id: note.id, 
        content: replyContent 
      });
      
      // Actualización optimista del estado local para feedback inmediato
      const newReply = {
        id: res.data.id,
        author: {
          name: currentUser.name,
          username: currentUser.username,
          avatar: currentUser.avatar
        },
        content: replyContent,
        upvotes: 0,
        downvotes: 0,
        votesData: [],
        createdAt: new Date().toISOString()
      };
      setReplies(prev => [newReply, ...prev]);
      setReplyContent('');
    } catch (e) {
      console.error("Error al procesar la respuesta", e);
    }
  };

  // Gestión de votos (positivo/negativo) sobre las respuestas
  const handleVote = async (replyId, type) => {
    try {
      const res = await api.post('/votes', { user_id: currentUser.id, reply_id: replyId, type });
      
      // Actualización reactiva de los contadores de votos basada en la respuesta del servidor
      setReplies(prev => prev.map(reply => {
        if (reply.id === replyId) {
          let newUpvotes = reply.upvotes;
          let newDownvotes = reply.downvotes;

          if (res.data.status === 'created') {
            if (type === 'up') newUpvotes++;
            else newDownvotes++;
          } else if (res.data.status === 'removed') {
            if (type === 'up') newUpvotes--;
            else newDownvotes--;
          } else if (res.data.status === 'updated') {
            if (type === 'up') {
              newUpvotes++;
              newDownvotes--;
            } else {
              newDownvotes++;
              newUpvotes--;
            }
          }

          // Persistencia de los datos de votación del usuario actual para la interfaz
          let newVotesData = [...(reply.votesData || [])];
          if (res.data.status === 'removed') {
            newVotesData = newVotesData.filter(v => v.user_id !== currentUser.id);
          } else if (res.data.status === 'created') {
            newVotesData.push({ user_id: currentUser.id, type });
          } else if (res.data.status === 'updated') {
            const vote = newVotesData.find(v => v.user_id === currentUser.id);
            if (vote) vote.type = type;
          }

          return { ...reply, upvotes: newUpvotes, downvotes: newDownvotes, votesData: newVotesData };
        }
        return reply;
      }).sort((a, b) => b.upvotes - a.upvotes)); // Re-ordenación por relevancia tras el voto
      
      // Sincronización global del estado de las notas
      refreshNotes();
    } catch (e) {
      console.error("Error al registrar el voto", e);
    }
  };

  return (
    <div className={`popup-overlay ${isClosing ? 'closing' : ''}`} onClick={handleBackdropClick}>
      <div className={`popup-content ${isClosing ? 'closing' : ''}`}>
        {/* Cabecera del modal de detalle */}
        <div className="popup-header">
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>Detalle del Note</h2>
          <button 
            onClick={handleClose} 
            style={{ 
              width: 32, 
              height: 32, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              background: 'var(--bg-color)', 
              borderRadius: '50%', 
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            className="close-btn-hover"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="popup-body">
          {/* Visualización del Note original en la parte superior */}
          <div className="original-post" style={{ padding: 0, border: 'none', background: 'transparent' }}>
            <Note note={note} onClick={() => {}} />
          </div>

          <div style={{ marginTop: 24, marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Respuestas y Aportes</h3>
            
            {/* Formulario de creación de nuevas respuestas */}
            <div className="creator-banner" style={{ padding: 16, marginBottom: 24, background: 'var(--bg-color)' }}>
              <img src={currentUser.avatar} alt="User" className="avatar" style={{ width: 40, height: 40 }} />
              <div className="creator-input-area" style={{ background: 'var(--bg-card)' }}>
                <textarea 
                  className="creator-textarea" 
                  placeholder="¿Puedes ayudar con esta duda? Escribe tu respuesta..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  style={{ minHeight: 40, fontSize: 14 }}
                ></textarea>
                <div className="creator-actions" style={{ marginTop: 8, paddingTop: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>La colaboración respetuosa mejora la comunidad.</span>
                  <button className="btn-primary" style={{ padding: '6px 16px', fontSize: 13 }} onClick={submitReply}>
                    <Send size={14} /> Enviar
                  </button>
                </div>
              </div>
            </div>

            {/* Listado de aportes de la comunidad */}
            <div>
              {replies.length === 0 && (
                <div style={{ padding: 40, textAlign: 'center', background: 'var(--bg-color)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)' }}>
                  <p style={{ color: 'var(--text-muted)' }}>Aún no hay aportes registrados.</p>
                </div>
              )}
              {replies.map((reply, index) => (
                <div key={reply.id} className="reply-card">
                  {/* Controles de votación lateral */}
                  <div className="vote-controls">
                    <button 
                      className="vote-btn" 
                      onClick={() => handleVote(reply.id, 'up')}
                      style={{ color: reply.votesData?.find(v => v.user_id === currentUser.id)?.type === 'up' ? 'var(--secondary)' : 'inherit' }}
                    >
                      <ArrowUp size={18} />
                    </button>
                    <span className="vote-count" style={{ color: (reply.upvotes - reply.downvotes) > 0 ? 'var(--secondary)' : 'inherit' }}>
                      {reply.upvotes - reply.downvotes}
                    </span>
                    <button 
                      className="vote-btn" 
                      onClick={() => handleVote(reply.id, 'down')}
                      style={{ color: reply.votesData?.find(v => v.user_id === currentUser.id)?.type === 'down' ? '#ef4444' : 'inherit' }}
                    >
                      <ArrowDown size={18} />
                    </button>
                  </div>
                  
                  {/* Cuerpo de la respuesta */}
                  <div style={{ flex: 1 }}>
                    {/* Indicador de aporte destacado basado en votos positivos */}
                    {index === 0 && reply.upvotes > 0 && (
                      <div className="top-reply-badge">
                        <Award size={14} />
                        Mejor Aporte
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }} className="reply-author-info">
                      <Link to={`/profile/${reply.author.username}`} onClick={onClose}>
                        <img src={reply.author.avatar} alt={reply.author.name} style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)' }} />
                      </Link>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Link to={`/profile/${reply.author.username}`} onClick={onClose} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <span style={{ fontWeight: 700, fontSize: 14, display: 'block' }}>{reply.author.name}</span>
                          </Link>
                          {/* Acción de seguimiento desde el listado de aportes */}
                          <FollowButton userId={reply.author.id} username={reply.author.username} />
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                          {reply.author.username.startsWith('@') ? reply.author.username : `@${reply.author.username}`}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: 15, lineHeight: 1.6 }}>{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotePopup;
