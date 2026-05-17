import React, { useState, useContext } from 'react';
import { X, Send, PenTool, Image as ImageIcon } from 'lucide-react';
import { AuthContext } from '../App';
import { TOPICS } from '../constants';

// Componente modal para la creación y publicación de nuevos Notes
const CreateNotePopup = ({ onClose, onCreate }) => {
  // Obtención del perfil de usuario desde el contexto global
  const { currentUser } = useContext(AuthContext);
  
  // Estados para la gestión del contenido, categorización, archivos adjuntos y transiciones
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('Fisica');
  const [image, setImage] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  // Ejecución de cierre con transición animada
  const handleClose = () => {
    setIsClosing(true);
    // Latencia para permitir la finalización de la animación CSS antes del desmontaje
    setTimeout(onClose, 300);
  };

  // Procesamiento y conversión a base64 del archivo de imagen seleccionado
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validación y envío del contenido al servidor
  const handleSubmit = async () => {
    // Restricción: Debe haber al menos contenido o imagen
    if (!content.trim() && !image) return;
    
    // Invocación del método de persistencia proporcionado por las propiedades
    await onCreate(topic, content, image);
    
    // Finalización automática tras el éxito de la operación
    handleClose();
  };

  return (
    <div className={`popup-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose} style={{ backdropFilter: 'blur(8px)', background: 'rgba(15, 23, 42, 0.7)' }}>
      <div className={`popup-content ${isClosing ? 'closing' : ''}`} onClick={e => e.stopPropagation()} style={{ maxWidth: 640, borderRadius: 24, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        {/* Cabecera informativa del modal de creación */}
        <div className="popup-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>Crear Nuevo Note</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Intercambio de conocimientos en la comunidad estudiantil.</p>
          </div>
          {/* Control de cierre del modal */}
          <button 
            onClick={handleClose} 
            style={{ 
              width: 36, 
              height: 36, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              background: 'var(--bg-color)', 
              borderRadius: '50%', 
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              color: 'var(--text-muted)'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-main)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="popup-body" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', gap: 16 }}>
            {/* Representación visual del autor */}
            <img 
              src={currentUser.avatar} 
              alt="User" 
              style={{ width: 48, height: 48, borderRadius: 14, border: '2px solid var(--border-color)', background: 'var(--bg-card)' }} 
            />
            <div style={{ flex: 1 }}>
              {/* Área de entrada de texto principal */}
              <textarea 
                className="creator-textarea" 
                placeholder="¿Qué quieres compartir hoy con la comunidad? Escribe aquí tus Notes, dudas o consejos..."
                value={content}
                onChange={(e) => setContent(e.target.value.substring(0, 500))} // Restricción técnica de 500 caracteres
                autoFocus
                style={{ 
                  minHeight: 160, 
                  fontSize: 16, 
                  background: 'var(--bg-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  color: 'var(--text-main)',
                  width: '100%',
                  resize: 'none',
                  lineHeight: 1.6,
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.boxShadow = 'none';
                }}
              ></textarea>

              {/* Indicador de extensión del contenido */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <span style={{ fontSize: 12, color: content.length > 450 ? '#ef4444' : 'var(--text-muted)', fontWeight: 600 }}>
                  {content.length}/500
                </span>
              </div>

              {/* Previsualización del recurso gráfico adjunto */}
              {image && (
                <div style={{ position: 'relative', marginBottom: 24, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <img src={image} alt="Preview" style={{ width: '100%', maxHeight: 350, objectFit: 'cover' }} />
                  <button 
                    onClick={() => setImage(null)}
                    style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', color: 'white', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              {/* Selección de categoría temática para el Note */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Tema del Note
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {TOPICS.filter(t => t !== 'Todos').map(t => (
                    <button 
                      key={t}
                      className={`topic-pill ${topic === t ? 'active' : ''}`}
                      onClick={() => setTopic(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Controles de adjuntos y acción definitiva de publicación */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                paddingTop: 20, 
                borderTop: '1px solid var(--border-color)' 
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <input 
                    type="file" 
                    id="note-image" 
                    hidden 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                  />
                  <label htmlFor="note-image" className="btn-secondary" style={{ border: '1px solid var(--border-color)', padding: 10, borderRadius: 12, color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ImageIcon size={20} />
                  </label>
                </div>
                <button 
                  className="btn-primary" 
                  onClick={handleSubmit} 
                  disabled={!content.trim() && !image}
                  style={{ 
                    padding: '12px 32px', 
                    borderRadius: 12, 
                    fontSize: 15, 
                    fontWeight: 700,
                    opacity: (!content.trim() && !image) ? 0.5 : 1,
                    cursor: (!content.trim() && !image) ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Send size={18} /> Publicar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNotePopup;
