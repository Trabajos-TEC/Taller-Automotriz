// src/components/LoginForm.tsx - VERSIÓN ACTUALIZADA
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
      {/* FONDO INDUSTRIAL */}
      <div className="login-background-industrial"></div>
      
      {/* CONTENIDO */}
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
            <div className="input-icon">📧</div>
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
            <div className="input-icon">🔒</div>
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
              ¿OLVIDÓ SU CONTRASEÑA?
            </a>
          </div>

          <button type="submit" className="btn-taller-login">
            INGRESAR AL SISTEMA
          </button>

          {/* BOTÓN CAMBIAR USUARIO */}
          <button type="button" className="btn-switch-user" onClick={() => alert('Funcionalidad de cambio de usuario')}>
            <span className="switch-icon">⇄</span>
            CAMBIAR USUARIO
          </button>
        </form>

        {/* INFORMACIÓN TÉCNICA */}
        <div className="taller-info-technical">
          <div className="info-line">
            <span className="info-label">DIRECCIÓN:</span>
            <span>AV. INDUSTRIAL #456, ZONA TÉCNICA</span>
          </div>
          <div className="info-line">
            <span className="info-label">CONTACTO:</span>
            <span>(01) 234-5678 | SOPORTE@TALLERTECNICO.COM</span>
          </div>
          <div className="info-line">
            <span className="info-label">HORARIO:</span>
            <span>LUN-VIE 07:00-19:00 | SÁB 08:00-14:00</span>
          </div>
          <div className="info-line">
            <span className="info-label">ESPECIALIDAD:</span>
            <span>MECÁNICA GENERAL | ELECTRÓNICA | DIAGNÓSTICO</span>
          </div>
        </div>

        {/* VERSIÓN DEL SISTEMA */}
        <div className="system-version">
          <span>v2.1.4 | © 2024 TALLER AUTOMOTRIZ | TODOS LOS DERECHOS RESERVADOS</span>
        </div>
      </div>
    </div>
  );
};

export default Login;