import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import CreateNotePopup from './components/CreateNotePopup';
import NotePopup from './components/NotePopup';
import Home from './pages/Home';
import Saved from './pages/Saved';
import Profile from './pages/Profile';
import Ranking from './pages/Ranking';
import Settings from './pages/Settings';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Contexto de autenticación para gestionar el estado del usuario de forma global
export const AuthContext = createContext(null);

// Configuración base de la API para conectar con el servidor Laravel
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

// Interceptor para inyectar el token en cada petición automáticamente
api.interceptors.request.use(config => {
  const saved = localStorage.getItem('studyNoteUser');
  if (saved) {
    const data = JSON.parse(saved);
    const token = data.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Interceptor para detectar si la sesión ha caducado (Error 401)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Si el servidor dice que no estamos autorizados, limpiamos todo y vamos al login
      localStorage.removeItem('studyNoteUser');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

function App() {
  // --- ESTADO GLOBAL ---

  // Recuperación del usuario y token desde localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('studyNoteUser');
    if (!saved) return null;
    try {
      const data = JSON.parse(saved);
      // Si los datos son viejos (no tienen token), ignoramos y limpiamos
      if (!data.token) {
        localStorage.removeItem('studyNoteUser');
        return null;
      }
      return data.user;
    } catch (e) {
      return null;
    }
  });

  const [notes, setNotes] = useState([]);         // Listado de notas en el feed
  const [hasMore, setHasMore] = useState(true);   // Control de paginación
  const [loading, setLoading] = useState(!!localStorage.getItem('studyNoteUser')); // Carga solo si hay usuario para buscar datos
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null); // Nota seleccionada para ver en detalle

  // Tema visual (Claro / Oscuro)
  const [theme, setTheme] = useState(() => localStorage.getItem('studyNoteTheme') || 'dark');

  // Aplicación del tema visual al documento
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('studyNoteTheme', theme);
  }, [theme]);

  // Función para obtener notas del servidor con soporte para carga incremental
  const fetchNotes = async (isInitial = true) => {
    try {
      const offset = isInitial ? 0 : notes.length;
      const limit = 6;
      const notesRes = await api.get(`/notes?offset=${offset}&limit=${limit}`);

      if (isInitial) {
        setNotes(notesRes.data);
        setHasMore(notesRes.data.length === limit);
      } else {
        if (notesRes.data.length < limit) setHasMore(false);
        setNotes(prev => [...prev, ...notesRes.data]);
      }
    } catch (error) {
      console.error("Error fetching notes", error);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  // Función para refrescar las notas actuales sin perder la paginación (útil al dar like o guardar)
  const refreshCurrentNotes = async () => {
    try {
      const currentCount = Math.max(6, notes.length);
      const notesRes = await api.get(`/notes?offset=0&limit=${currentCount}`);
      setNotes(notesRes.data);
    } catch (error) {
      console.error("Error refreshing current notes", error);
    }
  };

  const loadMoreNotes = () => fetchNotes(false);

  // Efecto para cargar las notas solo cuando el usuario está autenticado
  useEffect(() => {
    if (currentUser) {
      fetchNotes(true);
    }
  }, [currentUser]);

  // --- Sincronización automática de datos ---
  useEffect(() => {
    if (currentUser) {
      const pollData = async () => {
        try {
          // Actualización de notificaciones
          const resNotif = await api.get(`/notifications/${currentUser.id}`);
          setNotifications(resNotif.data);

          // Actualización de datos de perfil (puntos, seguidores, etc.)
          const resUser = await api.get(`/users/${currentUser.username}`);
          if (resUser.data) {
            // Actualización solo si existen cambios relevantes
            if (resUser.data.followers !== currentUser.followers || resUser.data.help_points !== currentUser.help_points) {
              const updatedUser = { ...currentUser, ...resUser.data };
              setCurrentUser(updatedUser);
              
              // Recuperamos el token para guardarlo junto con los nuevos datos
              const savedData = JSON.parse(localStorage.getItem('studyNoteUser'));
              localStorage.setItem('studyNoteUser', JSON.stringify({ token: savedData.token, user: updatedUser }));
            }
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      };

      const interval = setInterval(pollData, 10000); // Frecuencia de 10 segundos
      return () => clearInterval(interval);
    }
  }, [currentUser, api]);

  // Marcado de notificaciones como leídas
  const markNotificationsRead = async () => {
    if (!currentUser) return;
    try {
      await api.post(`/notifications/read/${currentUser.id}`);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Error marking notifications as read", error);
    }
  };

  // Finalización del proceso de login tras verificación exitosa
  const finishLogin = (authData) => {
    // authData ahora es { token, user }
    const { token, user } = authData;
    
    // Configuramos el token para futuras peticiones
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    setCurrentUser(user);
    localStorage.setItem('studyNoteUser', JSON.stringify({ token, user }));
  };

  // Peticiones de autenticación
  const login = async (username, password) => {
    const res = await api.post('/login', { username, password });
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/register', userData);
    return res.data;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('studyNoteUser');
    window.location.href = '/';
  };

  // Gestión de respuestas a notas
  const handleCreateReply = async (noteId, content) => {
    try {
      await api.post('/replies', { user_id: currentUser.id, note_id: noteId, content });
      const notesRes = await api.get('/notes');
      setNotes(notesRes.data);
    } catch (error) {
      console.error("Error creating reply", error);
    }
  };

  // Creación de nuevas notas
  const handleCreateNote = async (topic, content, image = null) => {
    try {
      await api.post('/notes/create', {
        user_id: currentUser.id,
        topic,
        content,
        image
      });
      fetchNotes(); // Refresco del feed
      setIsCreateNoteOpen(false);
    } catch (error) {
      console.error("Error creating note", error);
      alert("No se ha podido publicar la nota: " + (error.response?.data?.message || "Error de conexión"));
    }
  };

  // Actualización de datos de perfil
  const handleUpdateProfile = async (profileData) => {
    try {
      const res = await api.post('/user/update', { ...profileData, id: currentUser.id });
      const updatedUser = res.data;
      
      // Recuperamos el token actual para no perderlo
      const saved = JSON.parse(localStorage.getItem('studyNoteUser'));
      const token = saved.token;

      setCurrentUser(updatedUser);
      localStorage.setItem('studyNoteUser', JSON.stringify({ token, user: updatedUser }));
      return updatedUser;
    } catch (error) {
      console.error("Error updating profile", error);
      throw error;
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await api.delete(`/notes/${noteId}`, { data: { user_id: currentUser.id } });
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note", error);
    }
  };

  // Gestión de seguimiento de usuarios
  const handleFollow = async (followedId) => {
    if (!currentUser || !followedId) return;
    try {
      const res = await api.post('/follow', { follower_id: currentUser.id, followed_id: followedId });

      // Actualización optimista del estado local
      let newFollowingIds = [...(currentUser.following_ids || [])];
      if (res.data.status === 'followed') {
        if (!newFollowingIds.some(id => Number(id) === Number(followedId))) {
          newFollowingIds.push(followedId);
        }
      } else {
        newFollowingIds = newFollowingIds.filter(id => Number(id) !== Number(followedId));
      }

      const updatedUser = {
        ...currentUser,
        following_ids: newFollowingIds,
        following: res.data.status === 'followed'
          ? (Number(currentUser.following || 0) + 1)
          : Math.max(0, Number(currentUser.following || 0) - 1)
      };
      setCurrentUser(updatedUser);
      
      // Preservamos el token al guardar los datos actualizados tras seguir/dejar de seguir
      const savedData = JSON.parse(localStorage.getItem('studyNoteUser'));
      localStorage.setItem('studyNoteUser', JSON.stringify({ token: savedData.token, user: updatedUser }));
      
      return res.data.status;
    } catch (error) {
      console.error("Error following user", error);
    }
  };

  // Vista de carga inicial
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--bg-color)',
        color: 'white',
        gap: 24
      }}>
        <img src="/logo.png" alt="StudyNote" style={{ width: 80, height: 80, borderRadius: 20, animation: 'pulse 2s infinite ease-in-out' }} />
        <div className="spinner" style={{ width: 32, height: 32, borderWeight: '4px' }}></div>
      </div>
    );
  }

  const displayedNotes = notes;

  return (
    // Provisión del contexto global a toda la aplicación
    <AuthContext.Provider value={{
      currentUser,
      api,
      login,
      register,
      finishLogin,
      logout,
      searchQuery,
      setSearchQuery,
      updateProfile: handleUpdateProfile,
      setUser: setCurrentUser,
      refreshNotes: refreshCurrentNotes,
      setIsCreateNoteOpen,
      handleFollow,
      deleteNote: handleDeleteNote,
      notifications,
      markNotificationsRead,
      notes,
      hasMore,
      loadMoreNotes,
      setSelectedNote,
      theme,
      setTheme
    }}>
      <Router>
        <Routes>
          <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/inicio" replace />} />
          
          <Route path="/*" element={currentUser ? (
            <div className="app-container">
              <Sidebar />
              <div className="main-wrapper">
                <Topbar />
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<Navigate to="/inicio" replace />} />
                    <Route path="/inicio" element={<Home notes={displayedNotes} onCreateNote={handleCreateNote} hasMore={hasMore} onLoadMore={loadMoreNotes} />} />
                    <Route path="/ranking" element={<Ranking />} />
                    <Route path="/guardados" element={<Saved notes={displayedNotes} />} />
                    <Route path="/profile/:username" element={<Profile notes={displayedNotes} />} />
                    <Route path="/profile" element={<Profile notes={displayedNotes} />} />
                    <Route path="/ajustes" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>

              {/* Modales globales */}
              {isCreateNoteOpen && (
                <CreateNotePopup onClose={() => setIsCreateNoteOpen(false)} onCreate={handleCreateNote} />
              )}
              {selectedNote && (
                <NotePopup note={selectedNote} onClose={() => setSelectedNote(null)} />
              )}
            </div>
          ) : (
            <Navigate to="/login" replace />
          )} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
