// src/App.tsx - VERSIÓN ACTUALIZADA CON COMPONENTES SEPARADOS
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './styles/App.css';
import './styles/Menu.css';
import Login from './components/Login';
import Clientes from './pages/Clientes';
import Menu from './components/Menu';

// Componente de protección de rutas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('taller-auth') === 'true';
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Layout principal con menú
const MainLayout = ({ children, onLogout }: { children: React.ReactNode, onLogout: () => void }) => {
  const location = useLocation();
  const [currentSection, setCurrentSection] = useState('clientes');
  
  // Determinar la sección actual basada en la ruta
  React.useEffect(() => {
    const path = location.pathname;
    if (path.includes('clientes')) setCurrentSection('clientes');
    else if (path.includes('vehiculos')) setCurrentSection('vehiculos');
    else if (path.includes('inventario')) setCurrentSection('inventario');
    else if (path.includes('cotizacion')) setCurrentSection('cotizacion');
    else if (path.includes('orden-trabajo')) setCurrentSection('trabajos');
    else if (path.includes('reportes')) setCurrentSection('reportes');
    else setCurrentSection('clientes');
  }, [location]);

  const handleSectionChange = (sectionId: string) => {
    setCurrentSection(sectionId);
    // Navegar a la ruta correspondiente
    if (sectionId === 'clientes') window.location.href = '/clientes';
    else if (sectionId === 'vehiculos') window.location.href = '/vehiculos';
    else if (sectionId === 'inventario') window.location.href = '/inventario';
    else if (sectionId === 'cotizacion') window.location.href = '/cotizacion';
    else if (sectionId === 'trabajos') window.location.href = '/orden-trabajo';
    else if (sectionId === 'reportes') window.location.href = '/reportes';
  };

  const getPageTitle = () => {
    const titles: { [key: string]: string } = {
      'clientes': 'Gestión de Clientes',
      'vehiculos': 'Gestión de Vehículos',
      'inventario': 'Control de Inventario',
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
          {children}
        </div>
      </div>
    </div>
  );
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
          
          {/* Ruta principal con layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout onLogout={handleLogout}>
                <Clientes />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          {/* Ruta de clientes */}
          <Route path="/clientes" element={
            <ProtectedRoute>
              <MainLayout onLogout={handleLogout}>
                <Clientes />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          {/* Otras rutas (placeholder por ahora) */}
          <Route path="/vehiculos" element={
            <ProtectedRoute>
              <MainLayout onLogout={handleLogout}>
                <PlaceholderPage title="Gestión de Vehículos" />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/inventario" element={
            <ProtectedRoute>
              <MainLayout onLogout={handleLogout}>
                <PlaceholderPage title="Control de Inventario" />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/cotizacion" element={
            <ProtectedRoute>
              <MainLayout onLogout={handleLogout}>
                <PlaceholderPage title="Cotizaciones" />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/orden-trabajo" element={
            <ProtectedRoute>
              <MainLayout onLogout={handleLogout}>
                <PlaceholderPage title="Órdenes de Trabajo" />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/reportes" element={
            <ProtectedRoute>
              <MainLayout onLogout={handleLogout}>
                <PlaceholderPage title="Reportes y Estadísticas" />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          {/* Ruta por defecto */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;