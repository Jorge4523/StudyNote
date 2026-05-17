import React, { useState, useContext, useEffect } from 'react';
import Note from '../components/Note';
import NotePopup from '../components/NotePopup';
import { TOPICS } from '../constants';
import { BookMarked } from 'lucide-react';
import { AuthContext } from '../App';

// Biblioteca personal para la consulta de Notes guardados
const Saved = ({ notes }) => {
  // Obtención del usuario actual del contexto de autenticación
  const { currentUser } = useContext(AuthContext);
  
  // Estados para la gestión de filtros por tema y ordenación cronológica
  const [activeTopic, setActiveTopic] = useState('Todos');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' (recientes) o 'oldest' (antiguos)
  const [selectedNote, setSelectedNote] = useState(null);

  // Sincronización del título del documento
  useEffect(() => {
    document.title = 'Mi Biblioteca | StudyNote';
  }, []);

  // Filtrado del listado global para obtener únicamente los Notes guardados por el usuario
  const savedNotes = notes.filter(note => note.saves?.includes(currentUser.id));

  // Aplicación del filtro por categoría temática
  let filteredNotes = activeTopic === 'Todos' 
    ? savedNotes 
    : savedNotes.filter(note => note.topic === activeTopic);

  // Ordenación de los resultados según el criterio seleccionado
  filteredNotes = filteredNotes.sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortBy === 'recent' ? dateB - dateA : dateA - dateB;
  });

  return (
    <>
      {/* Cabecera informativa de la sección */}
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <BookMarked size={28} color="var(--primary)" />
            <h1 className="page-title" style={{ margin: 0 }}>Mi Biblioteca</h1>
          </div>
          <p style={{ color: 'var(--text-muted)' }}>Notes y consultas guardadas para consulta posterior.</p>
        </div>
      </div>

      {/* Interfaz de filtros y herramientas de ordenación */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, background: 'var(--bg-card)', padding: '12px 20px', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', gap: 20, flexWrap: 'wrap' }}>
        <div className="filters-bar" style={{ marginBottom: 0, flex: 1 }}>
          {TOPICS.map(topic => (
            <button 
              key={topic} 
              className={`filter-chip ${activeTopic === topic ? 'active' : ''}`}
              onClick={() => setActiveTopic(topic)}
              style={{ padding: '6px 14px', fontSize: 13 }}
            >
              {topic}
            </button>
          ))}
        </div>
        
        {/* Control de alternancia para el orden de visualización */}
        <div style={{ display: 'flex', background: 'var(--bg-color)', padding: 4, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setSortBy('recent')}
            style={{ 
              padding: '6px 12px', 
              fontSize: 12, 
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: sortBy === 'recent' ? 'var(--primary)' : 'transparent',
              color: sortBy === 'recent' ? 'white' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Más recientes
          </button>
          <button 
            onClick={() => setSortBy('oldest')}
            style={{ 
              padding: '6px 12px', 
              fontSize: 12, 
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: sortBy === 'oldest' ? 'var(--primary)' : 'transparent',
              color: sortBy === 'oldest' ? 'white' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Más antiguos
          </button>
        </div>
      </div>

      {/* Visualización del listado de Notes en formato cuadrícula */}
      <div className="notes-grid">
        {filteredNotes.length === 0 ? (
          // Vista informativa para estados vacíos
          <div style={{ gridColumn: '1 / -1', padding: 60, textAlign: 'center', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px dashed var(--border-color)' }}>
            <BookMarked size={48} color="var(--border-color)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Tu biblioteca está vacía</h3>
            <p style={{ color: 'var(--text-muted)' }}>Los Notes guardados durante la exploración aparecerán en esta sección.</p>
          </div>
        ) : (
          filteredNotes.map(note => (
            <Note 
              key={note.id} 
              note={note} 
              onClick={setSelectedNote} 
            />
          ))
        )}
      </div>

      {/* Visualización detallada en modal tras la selección de un Note */}
      {selectedNote && (
        <NotePopup 
          note={selectedNote} 
          onClose={() => setSelectedNote(null)} 
        />
      )}
    </>
  );
};

export default Saved;
