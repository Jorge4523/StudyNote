import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      padding: 20
    }}>
      <h1 style={{ fontSize: 80, fontWeight: 900, color: 'var(--primary)', marginBottom: 0 }}>404</h1>
      <h2 style={{ fontSize: 24, marginBottom: 16 }}>Página no encontrada</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 32, maxWidth: 400 }}>
        Lo sentimos, la página que estás buscando no existe o ha sido movida.
      </p>
      <Link to="/inicio" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <Home size={18} /> Volver al Inicio
      </Link>
    </div>
  );
};

export default NotFound;
