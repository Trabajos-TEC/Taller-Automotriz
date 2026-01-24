// src/App.tsx - VERSIÓN ACTUALIZADA CON CITAS
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './styles/App.css';
import './styles/Menu.css';
import Login from './components/Login';
import Clientes from './pages/Clientes';
import Vehiculos from './pages/Vehiculos';
import Inventario from './pages/InventarioAdmin';
import Citas from './pages/Citas';
import Menu from './components/Menu';

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
const MainLayout = ({ onLogout }: { onLogout: () => void }) => {
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
      setPageContent(<PlaceholderPage title="Cotizaciones" />);
    }
    else if (path.includes('orden-trabajo')) {
      setCurrentSection('trabajos');
      setPageContent(<PlaceholderPage title="Órdenes de Trabajo" />);
    }
    else if (path.includes('reportes')) {
      setCurrentSection('reportes');
      setPageContent(<PlaceholderPage title="Reportes y Estadísticas" />);
    }
    else {
      setCurrentSection('clientes');
      setPageContent(<Clientes />);
    }
  }, [location]);

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
        setPageContent(<PlaceholderPage title="Cotizaciones" />);
        window.history.pushState({}, '', '/cotizacion');
        break;
      case 'trabajos':
        setPageContent(<PlaceholderPage title="Órdenes de Trabajo" />);
        window.history.pushState({}, '', '/orden-trabajo');
        break;
      case 'reportes':
        setPageContent(<PlaceholderPage title="Reportes y Estadísticas" />);
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

  return (
    <div className="home">
      <Menu 
        onLogout={onLogout} 
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
        isAdmin={true}
      />
      
      <div className="home-head">
        <div>
          <h1>{getPageTitle()}</h1>
          <div className="muted">Administrador • {new Date().toLocaleDateString('es-ES')}</div>
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
  const handleLogout = () => {
    localStorage.removeItem('taller-auth');
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Ruta de login */}
          <Route path="/login" element={<Login />} />
          
          {/* Ruta principal - SIEMPRE usa MainLayout */}
          <Route path="*" element={
            <ProtectedRoute>
              <MainLayout onLogout={handleLogout} />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;