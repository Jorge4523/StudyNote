import React, { useState, useEffect, useContext } from 'react';
import { Trophy, Award, Star, TrendingUp, Crown } from 'lucide-react';
import { AuthContext } from '../App';
import { Link } from 'react-router-dom';

// Componente para visualizar el ranking de estudiantes basado en su contribución
const Ranking = () => {
  // Conexión a la API obtenida del contexto de autenticación
  const { api } = useContext(AuthContext);

  // Estados para gestionar el listado de clasificación y el estado de carga
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sincronización del título del documento
  useEffect(() => {
    document.title = 'Ranking | StudyNote';
  }, []);

  // Obtención del listado de usuarios con mayor puntuación desde el servidor
  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const res = await api.get('/ranking');
        setRanking(res.data);
      } catch (err) {
        console.error("Error al cargar el listado de clasificación", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, [api]);

  // Vista de carga inicial del ranking
  if (loading) return (
    <div className="loading-container" style={{ minHeight: '50vh' }}>
      <div className="spinner"></div>
      <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>Cargando ranking...</span>
    </div>
  );

  return (
    <div className="ranking-container" style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Cabecera con indicador visual de logros */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Trophy size={36} color="#fbbf24" /> Ranking de Ayuda
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Los estudiantes que más han aportado a la comunidad StudyNote.</p>
      </div>

      {/* Listado detallado de estudiantes en la clasificación */}
      <div className="ranking-card" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        {ranking.map((user, index) => (
          <div key={user.id} className={`ranking-item ${index === 0 ? 'winner-shimmer' : ''}`} style={{
            padding: index === 0 ? '32px 32px' : '20px 32px',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            borderBottom: index === ranking.length - 1 ? 'none' : '1px solid var(--border-color)',
            // Destacado visual para el podio
            background: index === 0
              ? 'transparent'
              : index < 3 ? 'rgba(79, 70, 229, 0.05)' : 'transparent',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {index === 0 && (
              <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.1 }}>
                <Trophy size={100} color="#fbbf24" />
              </div>
            )}
            {/* Indicador de posición con jerarquía visual para el podio */}
            <div style={{ width: 40, fontSize: index === 0 ? 32 : 24, fontWeight: 900, color: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {index === 0 && <Crown size={20} style={{ marginBottom: -5 }} />}
              #{index + 1}
            </div>

            {/* Representación visual del usuario con acceso al perfil */}
            <Link to={`/profile/${user.username}`}>
              <img
                src={user.avatar}
                alt={user.name}
                className={index === 0 ? 'winner-avatar-glow' : ''}
                style={{
                  width: index === 0 ? 70 : 50,
                  height: index === 0 ? 70 : 50,
                  borderRadius: 'var(--radius-sm)',
                  border: index === 0 ? '3px solid #fbbf24' : '2px solid var(--border-color)',
                }}
              />
            </Link>

            {/* Información de identificación del estudiante */}
            <div style={{ flex: 1 }}>
              <Link to={`/profile/${user.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <h3 style={{ fontSize: index === 0 ? 22 : 18, fontWeight: 800 }}>{user.name}</h3>
              </Link>
              <p style={{ fontSize: index === 0 ? 16 : 14, color: 'var(--text-muted)' }}>{user.username}</p>
            </div>

            {/* Puntuación acumulada de colaboración */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--secondary)', fontWeight: 800, fontSize: 20 }}>
                <Star size={20} fill="var(--secondary)" /> {user.help_points || 0}
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Puntos de Ayuda</span>
            </div>
          </div>
        ))}
      </div>

      {/* Sección informativa sobre el sistema de gamificación */}
      <div style={{ marginTop: 32, padding: 24, background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(16, 185, 129, 0.1))', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
        <TrendingUp size={32} style={{ marginBottom: 12, color: 'var(--primary)' }} />
        <h4 style={{ fontWeight: 700, marginBottom: 8 }}>¿Cómo subir en el ranking?</h4>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Las respuestas a dudas de otros compañeros en sus Notes permiten ganar puntos. Por cada <b>voto positivo</b> recibido, se sumará 1 punto de ayuda.
        </p>
      </div>
    </div>
  );
};

export default Ranking;
