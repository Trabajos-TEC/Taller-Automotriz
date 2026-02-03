// src/pages/Clientes.tsx - VERSIÓN CORREGIDA CON VERBATIM MODULE SYNTAX
import React, { useState, useEffect, useCallback } from 'react';
import { clienteService } from '../services/cliente.service';
import type { Cliente } from '../services/cliente.service'; // Importación type-only
import { useToast } from '../components/ToastContainer';
import '../styles/pages/Clientes.css';
import '../styles/Botones.css';

const Clientes: React.FC = () => {
  const { showToast } = useToast();
  
  // Estados
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Cliente | null>(null);
  const [showModalAgregar, setShowModalAgregar] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [newCliente, setNewCliente] = useState<Omit<Cliente, 'id'>>({ 
    nombre: '', 
    cedula: '', 
    correo: '', 
    numero: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Validaciones
  const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
  const soloNumeros = /^\d+$/;
  const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Cargar clientes
  const cargarClientes = useCallback(async (searchTerm?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await clienteService.getClientes(searchTerm);
      
      // Manejo flexible de respuestas
      if (response && Array.isArray(response)) {
        setClientes(response);
      } else if (response && (response as any).data && Array.isArray((response as any).data)) {
        setClientes((response as any).data);
      } else if (response && (response as any).success && Array.isArray((response as any).data)) {
        setClientes((response as any).data);
      } else {
        console.error('Formato de respuesta inesperado:', response);
        setClientes([]);
      }
    } catch (error: any) {
      console.error('Error cargando clientes:', error);
      setError(error.message || 'Error al cargar clientes');
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar clientes al iniciar
  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  // Filtrar clientes localmente
  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.cedula.includes(search) ||
    (c.correo && c.correo.toLowerCase().includes(search.toLowerCase()))
  );

  // Manejar búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim() !== '') {
        cargarClientes(search);
      } else {
        cargarClientes();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search, cargarClientes]);

  /* === VALIDAR FORMULARIO === */
  const validarCliente = (cliente: Omit<Cliente, 'id'>) => {
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
    }

    // Validar número telefónico - CORRECCIÓN: usar ?. para opcionales
    if (cliente.numero && !soloNumeros.test(cliente.numero.trim())) {
      newErrors.numero = 'Solo números';
    } else if (cliente.numero && cliente.numero.trim().length < 8) {
      newErrors.numero = 'Mínimo 8 dígitos';
    }

    // Validar correo - CORRECCIÓN: usar ?. para opcionales
    if (cliente.correo && !formatoCorreo.test(cliente.correo.trim())) {
      newErrors.correo = 'Formato inválido';
    }

    return newErrors;
  };

  /* === AGREGAR CLIENTE === */
  const agregarCliente = async () => {
    const validationErrors = validarCliente(newCliente);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      
      // Crear cliente sin el campo id - CORRECCIÓN: manejar undefined
      const clienteParaCrear: Omit<Cliente, 'id'> = {
        nombre: newCliente.nombre.trim(),
        cedula: newCliente.cedula.trim(),
        correo: newCliente.correo?.trim() || undefined,
        numero: newCliente.numero?.trim() || undefined
      };

      const response = await clienteService.createCliente(clienteParaCrear);
      
      // Verificar si la creación fue exitosa
      if (response) {
        // Recargar clientes
        await cargarClientes();
        
        // Limpiar y cerrar
        setNewCliente({ nombre: '', cedula: '', correo: '', numero: '' });
        setErrors({});
        setShowModalAgregar(false);
        
        showToast('Cliente agregado exitosamente', 'success');
      }
    } catch (error: any) {
      console.error('Error agregando cliente:', error);
      
      // Manejar error específico de cédula duplicada
      if (error.message && error.message.includes('cédula') || 
          error.message && error.message.includes('Cédula')) {
        setErrors({ ...errors, cedula: 'La cédula ya está registrada' });
      } else {
        showToast('Error al agregar cliente: ' + (error.message || 'Error desconocido'), 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  /* === EDITAR CLIENTE === */
  const guardarEdicion = async () => {
    if (!selected) return;

    const validationErrors = validarCliente(selected);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      
      // Preparar datos para actualizar
      const datosActualizar: Partial<Cliente> = {
        nombre: selected.nombre.trim(),
        correo: selected.correo?.trim() || undefined,
        numero: selected.numero?.trim() || undefined
      };

      const response = await clienteService.updateCliente(selected.cedula, datosActualizar);
      
      if (response) {
        await cargarClientes();
        setErrors({});
        setShowModalEditar(false);
        
        showToast('Cliente actualizado exitosamente', 'success');
      }
    } catch (error: any) {
      console.error('Error actualizando cliente:', error);
      showToast('Error al actualizar cliente: ' + (error.message || 'Error desconocido'), 'error');
    } finally {
      setLoading(false);
    }
  };

  /* === ELIMINAR CLIENTE === */
  const eliminarCliente = async (cedula: string) => {
    if (!confirm('¿Está seguro de eliminar este cliente?')) return;

    try {
      setLoading(true);
      
      const response = await clienteService.deleteCliente(cedula);
      
      if (response) {
        await cargarClientes();
        setSelected(null);
        
        showToast('Cliente eliminado exitosamente', 'success');
      }
    } catch (error: any) {
      console.error('Error eliminando cliente:', error);
      showToast('Error al eliminar cliente: ' + (error.message || 'Error desconocido'), 'error');
    } finally {
      setLoading(false);
    }
  };

  /* === LIMPIAR ERRORES === */
  const limpiarErrores = () => {
    setErrors({});
  };

  return (
    <div className="gestion-clientes">
      <div className="header-section">
        <div className="stats">
          <span className="stat-item">Total: {clientes.length} clientes</span>
          <span className="stat-item">Mostrando: {clientesFiltrados.length}</span>
          {loading && <span className="stat-item loading">Cargando...</span>}
          {error && <span className="stat-item error">{error}</span>}
        </div>
      </div>

      <div className="contenedor-principal">
        {/* CONTENEDOR IZQUIERDO - LISTA DE CLIENTES */}
        <div className="contenedor-lista">
          <div className="busqueda-agregar">
            <input
              className="search-bar"
              placeholder="Buscar por nombre, cédula o correo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              disabled={loading}
            />
            <button
              className="boton boton-agregar boton-grande"
              onClick={() => {
                setShowModalAgregar(true);
                limpiarErrores();
              }}
              disabled={loading}
            >
              <span className="icono">+</span>
              Agregar Cliente
            </button>
          </div>

          <div className="table-container">
            {loading && clientes.length === 0 ? (
              <div className="loading">Cargando clientes...</div>
            ) : error ? (
              <div className="error-message">Error: {error}</div>
            ) : (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Cédula</th>
                      <th>Teléfono</th>
                      <th>Correo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesFiltrados.map((cliente) => (
                      <tr 
                        key={cliente.cedula}
                        className={selected?.cedula === cliente.cedula ? 'selected-row' : ''}
                        onClick={() => setSelected(cliente)}
                      >
                        <td>{cliente.nombre}</td>
                        <td>{cliente.cedula}</td>
                        <td>{cliente.numero || 'N/A'}</td>
                        <td>{cliente.correo || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {clientesFiltrados.length === 0 && !loading && (
                  <div className="no-results">
                    {search ? 'No se encontraron clientes' : 'No hay clientes registrados'}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* DETALLES DEL CLIENTE */}
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
                  disabled={loading}
                >
                  Editar Cliente
                </button>
                <button 
                  className="boton boton-eliminar"
                  onClick={() => eliminarCliente(selected.cedula)}
                  disabled={loading}
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
        <div className="modal-overlay" onClick={() => !loading && setShowModalAgregar(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agregar Nuevo Cliente</h3>
              <button 
                className="btn-close" 
                onClick={() => !loading && setShowModalAgregar(false)}
                disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
                />
                {errors.cedula && <span className="error-message">{errors.cedula}</span>}
              </div>
              
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input
                  placeholder="ejemplo@email.com"
                  value={newCliente.correo || ''} 
                  onChange={e => setNewCliente({ ...newCliente, correo: e.target.value || undefined })}
                  className={errors.correo ? 'input-error' : ''}
                  disabled={loading}
                />
                {errors.correo && <span className="error-message">{errors.correo}</span>}
              </div>
              
              <div className="form-group">
                <label>Número Telefónico</label>
                <input
                  placeholder="8 dígitos, solo números"
                  value={newCliente.numero || ''} 
                  onChange={e => setNewCliente({ ...newCliente, numero: e.target.value || undefined })}
                  className={errors.numero ? 'input-error' : ''}
                  disabled={loading}
                />
                {errors.numero && <span className="error-message">{errors.numero}</span>}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="boton boton-guardar" 
                onClick={agregarCliente}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar Cliente'}
              </button>
              <button 
                className="boton boton-cancelar" 
                onClick={() => !loading && setShowModalAgregar(false)}
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR CLIENTE */}
      {showModalEditar && selected && (
        <div className="modal-overlay" onClick={() => !loading && setShowModalEditar(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Cliente</h3>
              <button 
                className="btn-close" 
                onClick={() => !loading && setShowModalEditar(false)}
                disabled={loading}
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
                  disabled={loading}
                />
                {errors.nombre && <span className="error-message">{errors.nombre}</span>}
              </div>
              
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input
                  placeholder="ejemplo@email.com"
                  value={selected.correo || ''}
                  onChange={e => setSelected({ ...selected, correo: e.target.value || undefined })}
                  className={errors.correo ? 'input-error' : ''}
                  disabled={loading}
                />
                {errors.correo && <span className="error-message">{errors.correo}</span>}
              </div>
              
              <div className="form-group">
                <label>Número Telefónico</label>
                <input
                  placeholder="8 dígitos, solo números"
                  value={selected.numero || ''} 
                  onChange={e => setSelected({ ...selected, numero: e.target.value || undefined })}
                  className={errors.numero ? 'input-error' : ''}
                  disabled={loading}
                />
                {errors.numero && <span className="error-message">{errors.numero}</span>}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="boton boton-guardar" 
                onClick={guardarEdicion}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button 
                className="boton boton-cancelar" 
                onClick={() => !loading && setShowModalEditar(false)}
                disabled={loading}
              >
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