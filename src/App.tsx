// src/App.tsx - VERSIÓN CORREGIDA CON SESIÓN
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './styles/App.css';
import './styles/Menu.css';
import Login from './components/Login';
import Clientes from './pages/Clientes';
import Vehiculos from './pages/Vehiculos';
import Inventario from './pages/InventarioAdmin';
import Citas from './pages/Citas';
import Trabajos from './pages/GestionTrabajos';
import Cotizacion from './pages/GestionCotizacion';
import ReportesAdministrador from './pages/ReportesAdmin';
import Menu from './components/Menu';

// Interface para la sesión
interface SessionData {
  nombre: string;
  rol: 'admin' | 'mecanico';
  email?: string;
}

// Componente de protección de rutas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('taller-auth') === 'true';
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Componentes placeholder para las otras páginas
const PlaceholderPage = ({ title }: { title: string }) => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h2>{title}</h2>
    <p>Esta sección está en desarrollo</p>
    <button 
      onClick={() => window.history.back()}
      style={{
        background: '#1f4f70',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        cursor: 'pointer',
        marginTop: '20px'
      }}
    >
      ← Volver a Clientes
    </button>
  </div>
);

// Layout principal con menú
const MainLayout = ({ onLogout, session }: { onLogout: () => void, session: SessionData }) => {
  const location = useLocation();
  const [currentSection, setCurrentSection] = useState('clientes');
  const [pageContent, setPageContent] = useState<React.ReactNode>(<Clientes />);
  
  // Determinar la sección actual basada en la ruta
  useEffect(() => {
    const path = location.pathname;
    
    if (path.includes('clientes')) {
      setCurrentSection('clientes');
      setPageContent(<Clientes />);
    }
    else if (path.includes('vehiculos')) {
      setCurrentSection('vehiculos');
      setPageContent(<Vehiculos/>);
    }
    else if (path.includes('inventario')) {
      setCurrentSection('inventario');
      setPageContent(<Inventario/>);
    }
    else if (path.includes('citas')) {
      setCurrentSection('citas');
      setPageContent(<Citas/>);
    }
    else if (path.includes('cotizacion')) {
      setCurrentSection('cotizacion');
      setPageContent(<Cotizacion session={session} />); // ✅ Cambiado de PlaceholderPage a Cotizacion
    }
    else if (path.includes('orden-trabajo')) {
      setCurrentSection('trabajos');
      setPageContent(<Trabajos session={session} />);
    }
    else if (path.includes('reportes')) {
      setCurrentSection('reportes');
      setPageContent(<ReportesAdministrador />); // ✅ Cambiado de PlaceholderPage a ReportesAdministrador
    }
    else {
      setCurrentSection('clientes');
      setPageContent(<Clientes />);
    }
  }, [location, session]);

  const handleSectionChange = (sectionId: string) => {
    setCurrentSection(sectionId);
    
    // Cambiar el contenido según la sección
    switch(sectionId) {
      case 'clientes':
        setPageContent(<Clientes />);
        window.history.pushState({}, '', '/clientes');
        break;
      case 'vehiculos':
        setPageContent(<Vehiculos/>);
        window.history.pushState({}, '', '/vehiculos');
        break;
      case 'inventario':
        setPageContent(<Inventario/>);
        window.history.pushState({}, '', '/inventario');
        break;
      case 'citas':
        setPageContent(<Citas/>);
        window.history.pushState({}, '', '/citas');
        break;
      case 'cotizacion':
        setPageContent(<Cotizacion session={session} />); // ✅ Cambiado de PlaceholderPage a Cotizacion
        window.history.pushState({}, '', '/cotizacion');
        break;
      case 'trabajos':
        setPageContent(<Trabajos session={session} />);
        window.history.pushState({}, '', '/orden-trabajo');
        break;
      case 'reportes':
        setPageContent(<ReportesAdministrador />); // ✅ Cambiado de Cotizacion a ReportesAdministrador
        window.history.pushState({}, '', '/reportes');
        break;
      default:
        setPageContent(<Clientes />);
        window.history.pushState({}, '', '/clientes');
    }
  };

  const getPageTitle = () => {
    const titles: { [key: string]: string } = {
      'clientes': 'Gestión de Clientes',
      'vehiculos': 'Gestión de Vehículos',
      'inventario': 'Control de Inventario',
      'citas': 'Gestión de Citas',
      'cotizacion': 'Cotizaciones',
      'trabajos': 'Órdenes de Trabajo',
      'reportes': 'Reportes y Estadísticas'
    };
    return titles[currentSection] || 'Sistema de Gestión';
  };

  const getUserInfo = () => {
    return `${session.nombre} • ${session.rol === 'admin' ? 'Administrador' : 'Mecánico'}`;
  };

  return (
    <div className="home">
      <Menu 
        onLogout={onLogout} 
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
        isAdmin={session.rol === 'admin'}
        userName={session.nombre}
        userRole={session.rol}
      />
      
      <div className="home-head">
        <div>
          <h1>{getPageTitle()}</h1>
          <div className="muted">{getUserInfo()} • {new Date().toLocaleDateString('es-ES')}</div>
        </div>
      </div>

      <div className={`center-panel ${currentSection}`}>
        <div className="panel-content">
          {pageContent}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [session, setSession] = useState<SessionData>(() => {
    // Recuperar sesión del localStorage al iniciar
    const savedSession = localStorage.getItem('taller-session');
    if (savedSession) {
      try {
        return JSON.parse(savedSession);
      } catch (e) {
        console.error('Error al parsear sesión:', e);
      }
    }
    // Valores por defecto si no hay sesión guardada
    return {
      nombre: 'Administrador',
      rol: 'admin' as const,
      email: 'admin@taller.com'
    };
  });

  const handleLogin = (userData: { nombre: string; rol: 'admin' | 'mecanico'; email?: string }) => {
    setSession(userData);
    localStorage.setItem('taller-session', JSON.stringify(userData));
    localStorage.setItem('taller-auth', 'true');
  };

  const handleLogout = () => {
    localStorage.removeItem('taller-auth');
    localStorage.removeItem('taller-session');
    setSession({ nombre: '', rol: 'admin' }); // Reset a valores vacíos
    window.location.href = '/login';
  };

  // Verificar si hay sesión al cargar
  useEffect(() => {
    const savedSession = localStorage.getItem('taller-session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setSession(parsed);
      } catch (e) {
        console.error('Error al cargar sesión:', e);
      }
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Ruta de login */}
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          
          {/* Ruta principal - SIEMPRE usa MainLayout */}
          <Route path="*" element={
            <ProtectedRoute>
              <MainLayout onLogout={handleLogout} session={session} />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;