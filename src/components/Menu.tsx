// src/components/Menu.tsx
import React, { useState, useRef, useEffect } from 'react';
import '../styles/Menu.css';
import AgregarUsuarioModal from './AgregarUsuarioModal';


interface MenuProps {
  onLogout: () => void;
  currentSection?: string;
  onSectionChange?: (section: string) => void;
  isAdmin?: boolean;
  userName?: string;
  userRole?: string;
}

const Menu: React.FC<MenuProps> = ({ 
  onLogout, 
  currentSection = 'clientes',
  onSectionChange,
  isAdmin = false,
  userName = 'Usuario',
  userRole = 'mecanico'
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { id: 'clientes', name: 'Clientes' },
    { id: 'vehiculos', name: 'Vehículos' },
    { id: 'inventario', name: 'Inventario' },
    { id: 'citas', name: 'Citas' },
    { id: 'trabajos', name: 'Trabajos' },
    { id: 'cotizacion', name: 'Cotización' },
    { id: 'reportes', name: 'Reportes' },
  ];
const [showModal, setShowModal] = useState(false);

{showModal && (
  <AgregarUsuarioModal onClose={() => setShowModal(false)} />
)}
  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuItemClick = (sectionId: string) => {
    if (onSectionChange) {
      onSectionChange(sectionId);
    }
    setMenuOpen(false);
  };

  const handleLogoutClick = () => {
    setMenuOpen(false);
    onLogout();
  };

return (
  <>
    <div className="menu-container" ref={menuRef}>
      <button
        className="btn-menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        title={menuOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      <div className={`dropdown-menu ${menuOpen ? 'show' : ''}`}>
        {/* Información del usuario */}
        <div className="user-info-header">
          <div className="user-name">{userName}</div>
          <div className="user-role">
            {userRole === 'admin' ? 'Administrador' : 'Mecánico'}
          </div>
        </div>

        <div className="separator"></div>

        <div className="menu-items">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`btn-menu btn-menu-${item.id} ${
                currentSection === item.id ? 'active' : ''
              }`}
              onClick={() => handleMenuItemClick(item.id)}
              title={`Ir a ${item.name}`}
            >
              {item.name}
            </button>
          ))}
        </div>

        <div className="menu-actions">
          {isAdmin && (
            <button
              className="btn-menu btn-menu-action btn-menu-agregar-usuario"
              onClick={() => setShowModal(true)}
            >
              Agregar Usuario
            </button>
          )}

          <button
            className="btn-menu btn-menu-action btn-menu-danger"
            onClick={handleLogoutClick}
            title="Cerrar sesión"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>

    {/* 🔽 MODAL 🔽 */}
    {showModal && (
      <AgregarUsuarioModal onClose={() => setShowModal(false)} />
    )}
  </>
);

};

export default Menu;