// src/pages/Clientes.tsx - VERSIÓN CON MÁS CLIENTES Y BOTONES REORGANIZADOS
import React, { useState } from 'react';
import '../styles/pages/Clientes.css';
import '../styles/Botones.css';

interface Cliente {
  nombre: string;
  cedula: string;
  correo: string;
  numero: string;
}

const Clientes: React.FC = () => {
  // Estado para la lista de clientes (más de 10 para probar scroll)
  const [clientes, setClientes] = useState<Cliente[]>([
    { nombre: 'Juan Pérez', cedula: '123456789', correo: 'juan@email.com', numero: '88889999' },
    { nombre: 'María García', cedula: '987654321', correo: 'maria@email.com', numero: '77776666' },
    { nombre: 'Carlos López', cedula: '456789123', correo: 'carlos@email.com', numero: '66665555' },
    { nombre: 'Ana Rodríguez', cedula: '321654987', correo: 'ana@email.com', numero: '55554444' },
    { nombre: 'Pedro Martínez', cedula: '789123456', correo: 'pedro@email.com', numero: '44443333' },
    { nombre: 'Laura Fernández', cedula: '654123987', correo: 'laura@email.com', numero: '33332222' },
    { nombre: 'Miguel Sánchez', cedula: '159753486', correo: 'miguel@email.com', numero: '22221111' },
    { nombre: 'Isabel Gómez', cedula: '357951852', correo: 'isabel@email.com', numero: '11110000' },
    { nombre: 'David Torres', cedula: '258147369', correo: 'david@email.com', numero: '99998888' },
    { nombre: 'Carmen Ruiz', cedula: '741852963', correo: 'carmen@email.com', numero: '88887777' },
    { nombre: 'Jorge Díaz', cedula: '369258147', correo: 'jorge@email.com', numero: '77776666' },
    { nombre: 'Elena Castro', cedula: '852369147', correo: 'elena@email.com', numero: '66665555' },
    { nombre: 'Francisco Ortega', cedula: '147258369', correo: 'francisco@email.com', numero: '55554444' },
    { nombre: 'Sofía Navarro', cedula: '963852741', correo: 'sofia@email.com', numero: '44443333' },
    { nombre: 'Raúl Jiménez', cedula: '321789654', correo: 'raul@email.com', numero: '33332222' },
    { nombre: 'Patricia Molina', cedula: '654987321', correo: 'patricia@email.com', numero: '22221111' },
    { nombre: 'Andrés Guerrero', cedula: '987321654', correo: 'andres@email.com', numero: '11110000' },
    { nombre: 'Beatriz Ramos', cedula: '123987456', correo: 'beatriz@email.com', numero: '99998888' },
    { nombre: 'José Ángel Santos', cedula: '456321789', correo: 'jose@email.com', numero: '88887777' },
    { nombre: 'Teresa Flores', cedula: '789654123', correo: 'teresa@email.com', numero: '77776666' },
    { nombre: 'Alberto Vázquez', cedula: '321456987', correo: 'alberto@email.com', numero: '66665555' },
    { nombre: 'Rosa Marín', cedula: '654789321', correo: 'rosa@email.com', numero: '55554444' },
    { nombre: 'Manuel León', cedula: '987123456', correo: 'manuel@email.com', numero: '44443333' },
    { nombre: 'Cristina Herrera', cedula: '159357486', correo: 'cristina@email.com', numero: '33332222' },
    { nombre: 'Sergio Peña', cedula: '357159852', correo: 'sergio@email.com', numero: '22221111' },
  ]);

  // Estados para búsqueda y selección
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Cliente | null>(null);
  const [showModalAgregar, setShowModalAgregar] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  
  // Estado para nuevo cliente
  const [newCliente, setNewCliente] = useState<Cliente>({ 
    nombre: '', 
    cedula: '', 
    correo: '', 
    numero: ''
  });

  // Estados para mensajes de error
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Validaciones
  const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
  const soloNumeros = /^\d+$/;
  const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Filtrar clientes
  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.cedula.includes(search) ||
    (c.correo && c.correo.toLowerCase().includes(search.toLowerCase()))
  );

  /* === VALIDAR FORMULARIO === */
  const validarCliente = (cliente: Cliente, isEdit: boolean = false) => {
    const newErrors: {[key: string]: string} = {};

    // Validar nombre
    if (!cliente.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (!soloLetras.test(cliente.nombre.trim())) {
      newErrors.nombre = 'Solo letras y espacios';
    }

    // Validar cédula
    if (!cliente.cedula.trim()) {
      newErrors.cedula = 'La cédula es obligatoria';
    } else if (!soloNumeros.test(cliente.cedula.trim())) {
      newErrors.cedula = 'Solo números';
    } else if (cliente.cedula.trim().length !== 9) {
      newErrors.cedula = 'Debe tener 9 dígitos';
    } else if (!isEdit) {
      // Solo validar duplicado al agregar, no al editar
      const existe = clientes.find(c => c.cedula === cliente.cedula.trim());
      if (existe) {
        newErrors.cedula = 'Cédula ya registrada';
      }
    }

    // Validar número telefónico
    if (cliente.numero && !soloNumeros.test(cliente.numero.trim())) {
      newErrors.numero = 'Solo números';
    } else if (cliente.numero && cliente.numero.trim().length < 8) {
      newErrors.numero = 'Mínimo 8 dígitos';
    }

    // Validar correo
    if (cliente.correo && !formatoCorreo.test(cliente.correo.trim())) {
      newErrors.correo = 'Formato inválido';
    }

    return newErrors;
  };

  /* === AGREGAR CLIENTE === */
  const agregarCliente = () => {
    const validationErrors = validarCliente(newCliente);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Crear cliente con datos limpios
    const cliente: Cliente = {
      nombre: newCliente.nombre.trim(),
      cedula: newCliente.cedula.trim(),
      correo: newCliente.correo.trim(),
      numero: newCliente.numero.trim()
    };

    setClientes([...clientes, cliente]);
    
    // Limpiar formulario y errores
    setNewCliente({ nombre: '', cedula: '', correo: '', numero: '' });
    setErrors({});
    setShowModalAgregar(false);
    
    alert('Cliente agregado exitosamente');
  };

  /* === EDITAR CLIENTE === */
  const guardarEdicion = () => {
    if (!selected) return;

    const validationErrors = validarCliente(selected, true);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Actualizar cliente en la lista
    setClientes(clientes.map(c => 
      c.cedula === selected.cedula ? selected : c
    ));
    
    setErrors({});
    setShowModalEditar(false);
    
    alert('Cliente actualizado exitosamente');
  };

  /* === ELIMINAR CLIENTE === */
  const eliminarCliente = (cedula: string) => {
    if (!confirm('¿Está seguro de eliminar este cliente?')) return;

    setClientes(clientes.filter(c => c.cedula !== cedula));
    setSelected(null);
    alert('Cliente eliminado');
  };

  /* === LIMPIAR ERRORES === */
  const limpiarErrores = () => {
    setErrors({});
  };

  return (
    <div className="gestion-clientes">
      <div className="header-section">
        <h1>🏁 Gestión de Clientes</h1>
        <div className="stats">
          <span className="stat-item">Total: {clientes.length} clientes</span>
          <span className="stat-item">Mostrando: {clientesFiltrados.length}</span>
          <span className="stat-item">Hoy: {new Date().toLocaleDateString('es-ES')}</span>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL CON LISTA Y DETALLES */}
      <div className="contenedor-principal">
        {/* CONTENEDOR IZQUIERDO - LISTA DE CLIENTES */}
        <div className="contenedor-lista">
          {/* BARRA DE BÚSQUEDA Y BOTÓN */}
          <div className="busqueda-agregar">
            <input
              className="search-bar"
              placeholder="Buscar por nombre, cédula o correo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button
              className="boton boton-agregar boton-grande"
              onClick={() => {
                setShowModalAgregar(true);
                limpiarErrores();
              }}
            >
              <span className="icono">+</span>
              Agregar Cliente
            </button>
          </div>

          {/* TABLA DE CLIENTES CON SCROLL */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cédula</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map((cliente, index) => (
                  <tr 
                    key={`${cliente.cedula}-${index}`}
                    className={selected?.cedula === cliente.cedula ? 'selected-row' : ''}
                    onClick={() => setSelected(cliente)}
                  >
                    <td>{cliente.nombre}</td>
                    <td>{cliente.cedula}</td>
                    <td>{cliente.numero || 'N/A'}</td>
                    <td>{cliente.correo || 'N/A'}</td>
                    <td className="acciones-cell">
                      <div className="acciones-vertical">
                        <button 
                          className="boton boton-editar boton-pequeno"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(cliente);
                            setShowModalEditar(true);
                            limpiarErrores();
                          }}
                        >
                          <span className="icono">✏️</span>
                          Editar
                        </button>
                        <button 
                          className="boton boton-eliminar boton-pequeno"
                          onClick={(e) => {
                            e.stopPropagation();
                            eliminarCliente(cliente.cedula);
                          }}
                        >
                          <span className="icono">🗑️</span>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {clientesFiltrados.length === 0 && (
              <div className="no-results">
                {search ? 'No se encontraron clientes' : 'No hay clientes registrados'}
              </div>
            )}
          </div>
        </div>

        {/* CONTENEDOR DERECHO - DETALLES DEL CLIENTE SELECCIONADO */}
        {selected && !showModalEditar && (
          <div className="contenedor-detalles">
            <div className="sidebar-details">
              <div className="sidebar-header">
                <h4>Detalles del Cliente</h4>
                <button 
                  className="btn-close" 
                  onClick={() => setSelected(null)}
                >
                  ×
                </button>
              </div>
              
              <div className="sidebar-body">
                <div className="detail-item">
                  <span className="detail-label">Nombre:</span>
                  <span className="detail-value">{selected.nombre}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Cédula:</span>
                  <span className="detail-value">{selected.cedula}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Teléfono:</span>
                  <span className="detail-value">{selected.numero || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Correo:</span>
                  <span className="detail-value">{selected.correo || 'N/A'}</span>
                </div>
              </div>
              
              <div className="sidebar-footer">
                <button 
                  className="boton boton-editar"
                  onClick={() => {
                    setShowModalEditar(true);
                    limpiarErrores();
                  }}
                >
                  Editar Cliente
                </button>
                <button 
                  className="boton boton-eliminar"
                  onClick={() => eliminarCliente(selected.cedula)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL AGREGAR CLIENTE */}
      {showModalAgregar && (
        <div className="modal-overlay" onClick={() => {
          setShowModalAgregar(false);
          limpiarErrores();
        }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agregar Nuevo Cliente</h3>
              <button 
                className="btn-close" 
                onClick={() => setShowModalAgregar(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  placeholder="Ej: Juan Pérez"
                  value={newCliente.nombre}
                  onChange={e => setNewCliente({ ...newCliente, nombre: e.target.value })}
                  className={errors.nombre ? 'input-error' : ''}
                />
                {errors.nombre && <span className="error-message">{errors.nombre}</span>}
              </div>
              
              <div className="form-group">
                <label>Cédula *</label>
                <input
                  placeholder="9 dígitos, solo números"
                  value={newCliente.cedula}
                  onChange={e => setNewCliente({ ...newCliente, cedula: e.target.value })}
                  className={errors.cedula ? 'input-error' : ''}
                />
                {errors.cedula && <span className="error-message">{errors.cedula}</span>}
              </div>
              
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input
                  placeholder="ejemplo@email.com"
                  value={newCliente.correo}
                  onChange={e => setNewCliente({ ...newCliente, correo: e.target.value })}
                  className={errors.correo ? 'input-error' : ''}
                />
                {errors.correo && <span className="error-message">{errors.correo}</span>}
              </div>
              
              <div className="form-group">
                <label>Número Telefónico</label>
                <input
                  placeholder="8 dígitos, solo números"
                  value={newCliente.numero}
                  onChange={e => setNewCliente({ ...newCliente, numero: e.target.value })}
                  className={errors.numero ? 'input-error' : ''}
                />
                {errors.numero && <span className="error-message">{errors.numero}</span>}
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="boton boton-guardar" onClick={agregarCliente}>
                Guardar Cliente
              </button>
              <button className="boton boton-cancelar" onClick={() => setShowModalAgregar(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR CLIENTE */}
      {showModalEditar && selected && (
        <div className="modal-overlay" onClick={() => {
          setShowModalEditar(false);
          limpiarErrores();
        }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Cliente</h3>
              <button 
                className="btn-close" 
                onClick={() => setShowModalEditar(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Cédula</label>
                <input
                  value={selected.cedula}
                  disabled
                  className="input-disabled"
                />
                <small className="field-info">La cédula no se puede modificar</small>
              </div>
              
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  placeholder="Ej: Juan Pérez"
                  value={selected.nombre}
                  onChange={e => setSelected({ ...selected, nombre: e.target.value })}
                  className={errors.nombre ? 'input-error' : ''}
                />
                {errors.nombre && <span className="error-message">{errors.nombre}</span>}
              </div>
              
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input
                  placeholder="ejemplo@email.com"
                  value={selected.correo}
                  onChange={e => setSelected({ ...selected, correo: e.target.value })}
                  className={errors.correo ? 'input-error' : ''}
                />
                {errors.correo && <span className="error-message">{errors.correo}</span>}
              </div>
              
              <div className="form-group">
                <label>Número Telefónico</label>
                <input
                  placeholder="8 dígitos, solo números"
                  value={selected.numero}
                  onChange={e => setSelected({ ...selected, numero: e.target.value })}
                  className={errors.numero ? 'input-error' : ''}
                />
                {errors.numero && <span className="error-message">{errors.numero}</span>}
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="boton boton-guardar" onClick={guardarEdicion}>
                Guardar Cambios
              </button>
              <button className="boton boton-cancelar" onClick={() => setShowModalEditar(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;