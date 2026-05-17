import React, { useState, useContext, useEffect } from 'react';
import { PenTool, Image as ImageIcon, Send, Sparkles, X } from 'lucide-react';
import Note from '../components/Note';
import NotePopup from '../components/NotePopup';
import { TOPICS } from '../constants'; // Temas de estudio oficiales
import { AuthContext } from '../App';

// Componente principal de la página de inicio
const Home = ({ notes, onCreateNote, hasMore, onLoadMore }) => {
  // Datos del usuario actual obtenidos del contexto global
  const { currentUser } = useContext(AuthContext);
  
  // Estados locales para filtros, contenido de nueva nota y gestión de imágenes
  const [activeTopic, setActiveTopic] = useState('Todos');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('Fisica');
  const [image, setImage] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);

  // Actualización del título de la pestaña al cargar el componente
  useEffect(() => {
    document.title = 'Inicio | StudyNote';
  }, []);

  // Procesamiento de la imagen seleccionada para subir
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Almacenamiento del resultado en base64 para previsualización
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Filtrado de notas según el tema seleccionado
  const filteredNotes = activeTopic === 'Todos' 
    ? notes 
    : notes.filter(note => note.topic === activeTopic);

  // Creación de una nueva publicación
  const createNote = async () => {
    // Validación mínima: debe haber texto o imagen
    if (!newNoteContent.trim() && !image) return;
    
    // Llamada a la función de creación persistente recibida por props
    await onCreateNote(selectedTopic, newNoteContent, image);
    
    // Reset del estado del formulario tras la publicación
    setNewNoteContent('');
    setImage(null);
  };

  return (
    <>
      {/* Cabecera de la página */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Tablón de Estudios</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Explora dudas, Notes y ayuda a tus compañeros.</p>
        </div>
      </div>

      {/* Área de creación de nuevas publicaciones */}
      <div className="creator-banner">
        <img src={currentUser.avatar} alt="User" className="avatar" />
        <div className="creator-input-area">
          <textarea 
            className="creator-textarea" 
            placeholder="¿Tienes alguna duda de clase? ¿O unos buenos Notes que compartir?"
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value.substring(0, 500))} // Límite de 500 caracteres
            style={{ 
              minHeight: 120, 
              background: 'var(--bg-color)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: 16,
              fontSize: 16,
              color: 'var(--text-main)',
              marginBottom: 16
            }}
          ></textarea>

          {/* Previsualización de imagen con opción de eliminar */}
          {image && (
            <div style={{ position: 'relative', marginBottom: 16, maxWidth: 400, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <img src={image} alt="Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }} />
              <button 
                onClick={() => setImage(null)}
                style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Selector de tema (pills) para la nueva publicación */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TOPICS.filter(t => t !== 'Todos').map(t => (
                <button 
                  key={t}
                  className={`topic-pill ${selectedTopic === t ? 'active' : ''}`}
                  onClick={() => setSelectedTopic(t)}
                  style={{ padding: '4px 12px', fontSize: 12 }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Acciones del creador: carga de archivos y publicación */}
          <div className="creator-actions" style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input 
                type="file" 
                id="home-image-upload" 
                hidden 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
              <label htmlFor="home-image-upload" className="btn-secondary" style={{ border: '1px solid var(--border-color)', padding: 10, borderRadius: 12, color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ImageIcon size={20} />
              </label>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div 
                data-tooltip="Gana puntos al ayudar"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: 12, 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  color: 'var(--secondary)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
              >
                <Sparkles size={20} />
              </div>

              <button 
                className="btn-primary" 
                onClick={createNote}
                disabled={!newNoteContent.trim() && !image}
                style={{ opacity: (!newNoteContent.trim() && !image) ? 0.5 : 1 }}
              >
                <Send size={16} /> Publicar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de filtros para el feed */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Últimas publicaciones</h2>
        <div className="filters-bar" style={{ marginBottom: 0 }}>
          {TOPICS.map(topic => (
            <button 
              key={topic} 
              className={`filter-chip ${activeTopic === topic ? 'active' : ''}`}
              onClick={() => setActiveTopic(topic)}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Rejilla de notas filtradas */}
      <div className="notes-grid">
        {filteredNotes.map(note => (
          <Note 
            key={note.id} 
            note={note} 
            onClick={setSelectedNote} 
          />
        ))}
      </div>

      {/* Paginación: Carga de más contenido */}
      {hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40, marginBottom: 40 }}>
          <button 
            className="btn-secondary" 
            onClick={onLoadMore}
            style={{ 
              padding: '12px 32px', 
              borderRadius: 12, 
              fontWeight: 600, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
              fontSize: 15,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)'
            }}
          >
            Cargar más publicaciones
          </button>
        </div>
      )}

      {/* Detalle de nota en popup */}
      {selectedNote && (
        <NotePopup 
          note={selectedNote} 
          onClose={() => setSelectedNote(null)} 
        />
      )}
    </>
  );
};

export default Home;
