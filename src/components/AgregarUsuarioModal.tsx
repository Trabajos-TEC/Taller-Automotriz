import React, { useState } from 'react';
import '../styles/AgregarUsuarioModal.css';

interface Props {
  onClose: () => void;
}

const AgregarUsuarioModal: React.FC<Props> = ({ onClose }) => {
  const [nombre, setNombre] = useState('');

  const [correo, setCorreo] = useState('');
  const [cedula, setCedula] = useState('');
  const [roles, setRol] = useState('mecanico');

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const res = await fetch('http://localhost:3001/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre,
        correo,
        cedula,
        roles
      })
    });

    const data = await res.json();

 if (!res.ok) {
  console.error('Error backend:', data);
  alert(data.message || 'Error al crear usuario');
  return;
}


    alert('Usuario creado correctamente');
    onClose();
  } catch (error) {
    console.error(error);
    alert('Error de conexión con el servidor');
  }
};


  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">Agregar Usuario</h2>

        <form className="modal-form" onSubmit={handleSubmit}>
          <input
  type="text"
  placeholder="Nombre completo"
  value={nombre}
  onChange={e => setNombre(e.target.value)}
  required
/>

          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={e => setCorreo(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Cédula"
            value={cedula}
            onChange={e => setCedula(e.target.value)}
            required
          />

          <select value={roles} onChange={e => setRol(e.target.value)}>
            <option value="cliente">Cliente</option>
            <option value="mecanico">Mecánico</option>
            <option value="admin">Admin</option>
           
          </select>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-modal btn-modal-cancel"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn-modal btn-modal-primary"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgregarUsuarioModal;
