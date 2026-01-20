// src/components/LoginForm.tsx - VERSIÓN SIN EMOJIS Y SILUETAS NEGRAS
import React, { useState } from 'react';
import '../styles/Login.css';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación simple
    const newErrors = {
      email: formData.email ? '' : 'Email es requerido',
      password: formData.password ? '' : 'Contraseña es requerida'
    };
    
    setErrors(newErrors);
    
    if (!newErrors.email && !newErrors.password) {
      // Guardar autenticación en localStorage
      localStorage.setItem('taller-auth', 'true');
      
      // Si marcó "Recordar sesión", guardar por más tiempo
      if (formData.rememberMe) {
        localStorage.setItem('taller-remember', 'true');
      }
      
      // Redirigir a la página de Clientes
      window.location.href = '/clientes';
    }
  };

  return (
    <div className="login-taller-container">
      {/* CONTENEDOR PRINCIPAL CON DOS COLUMNAS */}
      <div className="login-two-columns">
        
        {/* COLUMNA IZQUIERDA - FORMULARIO */}
        <div className="login-left-column">
          <div className="login-content">
            {/* LOGO TALLER */}
            <div className="taller-logo-header">
              <div className="logo-symbol">
                <div className="gear-icon"></div>
                <div className="wheel-icon"></div>
              </div>
              <div className="taller-title">
                <h1>TALLER AUTOMOTRIZ</h1>
                <p className="subtitle">SISTEMA DE GESTIÓN TÉCNICA</p>
              </div>
            </div>

            {/* FORMULARIO */}
            <form onSubmit={handleSubmit} className="login-form-taller">
              <div className="input-group-taller">
                <div className="input-icon">
                  {/* Silueta de email en negro */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="M22 6l-10 7L2 6"/>
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="USUARIO / CORREO ELECTRÓNICO"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'input-error-taller' : ''}
                />
              </div>
              {errors.email && <div className="error-taller">{errors.email}</div>}

              <div className="input-group-taller">
                <div className="input-icon">
                  {/* Silueta de candado en negro */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ece4e4" strokeWidth="2">
                    <rect x="5" y="11" width="14" height="10" rx="2"/>
                    <path d="M12 15v2"/>
                    <circle cx="12" cy="8" r="4" strokeWidth="2"/>
                  </svg>
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="CONTRASEÑA"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'input-error-taller' : ''}
                />
              </div>
              {errors.password && <div className="error-taller">{errors.password}</div>}

              <div className="options-taller">
                <label className="checkbox-taller">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  <span>MANTENER SESIÓN INICIADA</span>
                </label>
                <a href="/recuperar" className="link-taller">
                  {/* Silueta de candado abierto en negro */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  ¿OLVIDÓ SU CONTRASEÑA?
                </a>
              </div>

              <button type="submit" className="btn-taller-login">
                {/* Silueta de flecha derecha en negro */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                  <path d="M5 12h14"/>
                  <path d="M12 5l7 7-7 7"/>
                </svg>
                INGRESAR AL SISTEMA
              </button>

              {/* BOTÓN CAMBIAR USUARIO */}
              <button type="button" className="btn-switch-user" onClick={() => alert('Funcionalidad de cambio de usuario')}>
                {/* Silueta de intercambio en negro */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                  <path d="M17 3l4 4-4 4"/>
                  <path d="M21 7H7a4 4 0 00-4 4v1"/>
                  <path d="M7 21l-4-4 4-4"/>
                  <path d="M3 17h14a4 4 0 004-4v-1"/>
                </svg>
                CAMBIAR USUARIO
              </button>
            </form>

            {/* VERSIÓN DEL SISTEMA */}
            <div className="system-version">
              {/* Silueta de engranaje en negro */}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9aa4b2" strokeWidth="2">
                <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
              </svg>
              v2.1.4 | © 2026 TALLER AUTOMOTRIZ | TODOS LOS DERECHOS RESERVADOS
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA - ROMBOIDE NARANJA CON INFORMACIÓN */}
        <div className="login-right-column">
          <div className="romboid-info-container">
            <div className="romboid-content">
              <div className="romboid-header">
                <div className="romboid-icon">
                  {/* Silueta de edificio industrial en negro */}
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                    <path d="M9 22V12h6v10"/>
                  </svg>
                </div>
                <h2>INFORMACIÓN DEL TALLER</h2>
              </div>
              
              <div className="romboid-info-grid">
                <div className="info-item">
                  <div className="info-icon">
                    {/* Silueta de ubicación en negro */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f5ebeb" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div className="info-content">
                    <h3>DIRECCIÓN</h3>
                    <p>AV. INDUSTRIAL #456, ZONA TÉCNICA</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    {/* Silueta de teléfono en negro */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fffafa" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                    </svg>
                  </div>
                  <div className="info-content">
                    <h3>CONTACTO</h3>
                    <p>(01) 234-5678</p>
                    <p>SOPORTE@TALLERTECNICO.COM</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    {/* Silueta de reloj en negro */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                  </div>
                  <div className="info-content">
                    <h3>HORARIO</h3>
                    <p>LUN-VIE 07:00-19:00</p>
                    <p>SÁB 08:00-14:00</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    {/* Silueta de llave inglesa en negro */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
                    </svg>
                  </div>
                  <div className="info-content">
                    <h3>ESPECIALIDAD</h3>
                    <p>MECÁNICA GENERAL</p>
                    <p>ELECTRÓNICA | DIAGNÓSTICO</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    {/* Silueta de automóvil en negro */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f8f8f8" strokeWidth="2">
                      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 002 12v4c0 .6.4 1 1 1h2"/>
                      <circle cx="7" cy="17" r="2"/>
                      <path d="M9 17h6"/>
                      <circle cx="17" cy="17" r="2"/>
                    </svg>
                  </div>
                  <div className="info-content">
                    <h3>CAPACIDAD</h3>
                    <p>12 VEHÍCULOS SIMULTÁNEOS</p>
                    <p>SERVICIO EXPRESS DISPONIBLE</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    {/* Silueta de trofeo en negro */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                      <path d="M6 9H4.5a2.5 2.5 0 010-5H6"/>
                      <path d="M18 9h1.5a2.5 2.5 0 000-5H18"/>
                      <path d="M4 22h16"/>
                      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                      <path d="M18 2H6v7a6 6 0 0012 0V2z"/>
                    </svg>
                  </div>
                  <div className="info-content">
                    <h3>CERTIFICACIONES</h3>
                    <p>TÉCNICOS CERTIFICADOS</p>
                    <p>ISO 9001:2015</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;