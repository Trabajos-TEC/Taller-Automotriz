// src/pages/Vehiculos.tsx - VERSIÓN SIMPLIFICADA
import React, { useState, useEffect, useCallback } from 'react';
import { vehiculoClienteService } from '../services/vehiculo_cliente.service';
import { vehiculoBaseService } from '../services/vehiculo_base.service';
import { clienteService } from '../services/cliente.service';
import type { VehiculoClienteCompleto } from '../services/vehiculo_cliente.service';
import type { VehiculoBase as VehiculoBaseServicio } from '../services/vehiculo_base.service';
import type { Cliente as ClienteServicio } from '../services/cliente.service';
import { useToast } from '../components/ToastContainer';
import '../styles/pages/Vehiculos.css';

// Interface local
interface Vehiculo {
  id: number;
  placa: string;
  cliente_id: number;
  cliente_cedula: string;
  cliente_nombre: string;
  cliente_telefono: string;
  vehiculo_base_id: number;
  vehiculo_marca: string;
  vehiculo_modelo: string;
  vehiculo_anio: number;
  vehiculo_tipo: string;
}

interface VehiculoBase {
  id: number;
  marca: string;
  modelo: string;
  anio: number;
  tipo: string;
}

interface Cliente {
  id: number;
  cedula: string;
  nombre: string;
  numero?: string;
  correo?: string;
}

const Vehiculos: React.FC = () => {
  const { showToast } = useToast();
  
  // Estados principales
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Vehiculo | null>(null);
  const [showModalAgregar, setShowModalAgregar] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para nuevo vehículo (SIMPLIFICADO)
  const [newVehiculo, setNewVehiculo] = useState({
    placa: '',
    cliente_id: 0,
    cliente_cedula: '',
    cliente_nombre: '',
    vehiculo_base_id: 0,
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Datos relacionados
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vehiculosBase, setVehiculosBase] = useState<VehiculoBase[]>([]);

  // Validaciones
  const formatoPlaca = /^[A-Z0-9]+$/;

  // Función para transformar datos del servicio
  const transformarVehiculo = (vehiculo: VehiculoClienteCompleto): Vehiculo => ({
    id: vehiculo.id || 0,
    placa: vehiculo.placa || '',
    cliente_id: vehiculo.cliente_id || 0,
    cliente_cedula: vehiculo.cliente_cedula || '',
    cliente_nombre: vehiculo.cliente_nombre || '',
    cliente_telefono: vehiculo.cliente_telefono || '',
    vehiculo_base_id: vehiculo.vehiculo_base_id || 0,
    vehiculo_marca: vehiculo.vehiculo_marca || '',
    vehiculo_modelo: vehiculo.vehiculo_modelo || '',
    vehiculo_anio: vehiculo.vehiculo_anio || 0,
    vehiculo_tipo: vehiculo.vehiculo_tipo || ''
  });

  const transformarVehiculoBase = (vehiculo: VehiculoBaseServicio): VehiculoBase => ({
    id: vehiculo.id || 0,
    marca: vehiculo.marca || '',
    modelo: vehiculo.modelo || '',
    anio: vehiculo.anio || 0,
    tipo: vehiculo.tipo || ''
  });

  const transformarCliente = (cliente: ClienteServicio): Cliente => ({
    id: cliente.id || 0,
    cedula: cliente.cedula || '',
    nombre: cliente.nombre || '',
    numero: cliente.numero || '',
    correo: cliente.correo || ''
  });

  // Cargar vehículos de clientes
  const cargarVehiculosClientes = useCallback(async (searchTerm?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await vehiculoClienteService.getVehiculosClientes(searchTerm);
      
      if (response && (response as any).data && Array.isArray((response as any).data)) {
        const vehiculosTransformados = (response as any).data.map(transformarVehiculo);
        setVehiculos(vehiculosTransformados);
      } else if (response && Array.isArray(response)) {
        const vehiculosTransformados = response.map(transformarVehiculo);
        setVehiculos(vehiculosTransformados);
      } else {
        setVehiculos([]);
      }
    } catch (error: any) {
      console.error('Error cargando vehículos:', error);
      setError('Error al cargar vehículos: ' + (error.message || 'Error desconocido'));
      setVehiculos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar clientes
  const cargarClientes = async () => {
    try {
      const response = await clienteService.getClientes();
      
      if (response && (response as any).data && Array.isArray((response as any).data)) {
        const clientesTransformados = (response as any).data.map(transformarCliente);
        setClientes(clientesTransformados);
      } else if (response && Array.isArray(response)) {
        const clientesTransformados = response.map(transformarCliente);
        setClientes(clientesTransformados);
      }
    } catch (error) {
      console.error('Error cargando clientes:', error);
    }
  };

  // Cargar vehículos base
  const cargarVehiculosBase = async () => {
    try {
      const response = await vehiculoBaseService.getVehiculosBase();
      
      if (response && (response as any).data && Array.isArray((response as any).data)) {
        const vehiculosBaseTransformados = (response as any).data.map(transformarVehiculoBase);
        setVehiculosBase(vehiculosBaseTransformados);
      } else if (response && Array.isArray(response)) {
        const vehiculosBaseTransformados = response.map(transformarVehiculoBase);
        setVehiculosBase(vehiculosBaseTransformados);
      }
    } catch (error) {
      console.error('Error cargando vehículos base:', error);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    cargarVehiculosClientes();
    cargarClientes();
    cargarVehiculosBase();
  }, []);

  // Filtrar vehículos localmente
  const vehiculosFiltrados = vehiculos.filter(v =>
    v.placa.toLowerCase().includes(search.toLowerCase()) ||
    v.vehiculo_marca.toLowerCase().includes(search.toLowerCase()) ||
    v.vehiculo_modelo.toLowerCase().includes(search.toLowerCase()) ||
    v.cliente_nombre.toLowerCase().includes(search.toLowerCase()) ||
    v.cliente_cedula.includes(search)
  );

  // Búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim() !== '') {
        cargarVehiculosClientes(search);
      } else {
        cargarVehiculosClientes();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search, cargarVehiculosClientes]);

  /* === VALIDAR FORMULARIO === */
  const validarVehiculo = (vehiculo: any) => {
    const newErrors: {[key: string]: string} = {};

    if (!vehiculo.placa.trim()) {
      newErrors.placa = 'La placa es obligatoria';
    } else if (!formatoPlaca.test(vehiculo.placa.trim())) {
      newErrors.placa = 'Solo letras mayúsculas y números';
    }

    if (!vehiculo.cliente_id || vehiculo.cliente_id === 0) {
      newErrors.cliente_id = 'Debe seleccionar un cliente';
    }

    if (!vehiculo.vehiculo_base_id || vehiculo.vehiculo_base_id === 0) {
      newErrors.vehiculo_base_id = 'Debe seleccionar un modelo de vehículo';
    }

    return newErrors;
  };

  /* === AGREGAR VEHÍCULO === */
  const agregarVehiculo = async () => {
    const validationErrors = validarVehiculo(newVehiculo);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      
      const vehiculoData = {
        placa: newVehiculo.placa.trim().toUpperCase(),
        cliente_id: newVehiculo.cliente_id,
        vehiculo_base_id: newVehiculo.vehiculo_base_id,
      };

      const response = await vehiculoClienteService.createVehiculoCliente(vehiculoData);
      
      if (response) {
        await cargarVehiculosClientes();
        
        setNewVehiculo({
          placa: '',
          cliente_id: 0,
          cliente_cedula: '',
          cliente_nombre: '',
          vehiculo_base_id: 0,
        });
        setErrors({});
        setShowModalAgregar(false);
        
        showToast('Vehículo agregado exitosamente', 'success');
      }
    } catch (error: any) {
      console.error('Error agregando vehículo:', error);
      
      if (error.message && error.message.includes('placa') || error.message && error.message.includes('Placa')) {
        setErrors({ ...errors, placa: 'La placa ya está registrada' });
      } else {
        showToast('Error al agregar vehículo: ' + (error.message || 'Error desconocido'), 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  /* === EDITAR VEHÍCULO === */
  const guardarEdicion = async () => {
    if (!selected) return;

    const validationErrors = validarVehiculo(selected);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      
      const updateData = {
        cliente_id: selected.cliente_id,
        vehiculo_base_id: selected.vehiculo_base_id,
      };

      const response = await vehiculoClienteService.updateVehiculoCliente(selected.id, updateData);
      
      if (response) {
        await cargarVehiculosClientes();
        setErrors({});
        setShowModalEditar(false);
        
        showToast('Vehículo actualizado exitosamente', 'success');
      }
    } catch (error: any) {
      console.error('Error actualizando vehículo:', error);
      showToast('Error al actualizar vehículo: ' + (error.message || 'Error desconocido'), 'error');
    } finally {
      setLoading(false);
    }
  };

  /* === ELIMINAR VEHÍCULO === */
  const eliminarVehiculo = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este vehículo?')) return;

    try {
      setLoading(true);
      
      const response = await vehiculoClienteService.deleteVehiculoCliente(id);
      
      if (response) {
        await cargarVehiculosClientes();
        setSelected(null);
        
        showToast('Vehículo eliminado exitosamente', 'success');
      }
    } catch (error: any) {
      console.error('Error eliminando vehículo:', error);
      showToast('Error al eliminar vehículo: ' + (error.message || 'Error desconocido'), 'error');
    } finally {
      setLoading(false);
    }
  };

  /* === LIMPIAR ERRORES === */
  const limpiarErrores = () => {
    setErrors({});
  };

  // Manejar selección de cliente
  const handleClienteChange = (clienteId: number) => {
    const clienteSeleccionado = clientes.find(c => c.id === clienteId);
    if (clienteSeleccionado) {
      setNewVehiculo({
        ...newVehiculo,
        cliente_id: clienteId,
        cliente_cedula: clienteSeleccionado.cedula,
        cliente_nombre: clienteSeleccionado.nombre
      });
    }
  };

  return (
    <div className="gestion-vehiculos">
      <div className="header-section">
        <div className="stats">
          <span className="stat-item">Total: {vehiculos.length} vehículos</span>
          <span className="stat-item">Mostrando: {vehiculosFiltrados.length}</span>
          {loading && <span className="stat-item loading">Cargando...</span>}
          {error && <span className="stat-item error">{error}</span>}
        </div>
      </div>

      <div className="contenedor-principal">
        {/* CONTENEDOR IZQUIERDO - LISTA DE VEHÍCULOS */}
        <div className="contenedor-lista">
          <div className="busqueda-agregar">
            <input
              className="search-bar"
              placeholder="Buscar por placa, marca, modelo o cliente..."
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
              Agregar Vehículo
            </button>
          </div>

          <div className="table-container">
            {loading && vehiculos.length === 0 ? (
              <div className="loading">Cargando vehículos...</div>
            ) : error ? (
              <div className="error-message">Error: {error}</div>
            ) : (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Placa</th>
                      <th>Marca</th>
                      <th>Modelo</th>
                      <th>Año</th>
                      <th>Tipo</th>
                      <th>Cliente</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehiculosFiltrados.map((vehiculo) => (
                      <tr 
                        key={`${vehiculo.id}-${vehiculo.placa}`}
                        className={selected?.id === vehiculo.id ? 'selected-row' : ''}
                        onClick={() => setSelected(vehiculo)}
                      >
                        <td className="placa-column">{vehiculo.placa}</td>
                        <td>{vehiculo.vehiculo_marca}</td>
                        <td>{vehiculo.vehiculo_modelo}</td>
                        <td>{vehiculo.vehiculo_anio}</td>
                        <td>{vehiculo.vehiculo_tipo}</td>
                        <td>{vehiculo.cliente_nombre}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {vehiculosFiltrados.length === 0 && !loading && (
                  <div className="no-results">
                    {search ? 'No se encontraron vehículos' : 'No hay vehículos registrados'}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* DETALLES DEL VEHÍCULO SELECCIONADO */}
        {selected && !showModalEditar && (
          <div className="contenedor-detalles">
            <div className="sidebar-details">
              <div className="sidebar-header">
                <h4>Detalles del Vehículo</h4>
                <button className="btn-close" onClick={() => setSelected(null)}>×</button>
              </div>
              
              <div className="sidebar-body">
                <div className="detail-item">
                  <span className="detail-label">Placa:</span>
                  <span className="detail-value placa-value">{selected.placa}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Marca:</span>
                  <span className="detail-value">{selected.vehiculo_marca}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Modelo:</span>
                  <span className="detail-value">{selected.vehiculo_modelo}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Año:</span>
                  <span className="detail-value">{selected.vehiculo_anio}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Tipo:</span>
                  <span className="detail-value">{selected.vehiculo_tipo}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Cliente:</span>
                  <span className="detail-value">{selected.cliente_nombre}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Cédula Cliente:</span>
                  <span className="detail-value">{selected.cliente_cedula}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Teléfono:</span>
                  <span className="detail-value">{selected.cliente_telefono || 'N/A'}</span>
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
                  Editar Vehículo
                </button>
                <button 
                  className="boton boton-eliminar"
                  onClick={() => eliminarVehiculo(selected.id)}
                  disabled={loading}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL AGREGAR VEHÍCULO */}
      {showModalAgregar && (
        <div className="modal-overlay" onClick={() => !loading && setShowModalAgregar(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agregar Nuevo Vehículo</h3>
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
                <label>Placa *</label>
                <input
                  placeholder="Ej: ABC123"
                  value={newVehiculo.placa}
                  onChange={e => setNewVehiculo({ ...newVehiculo, placa: e.target.value.toUpperCase() })}
                  className={errors.placa ? 'input-error' : ''}
                  disabled={loading}
                />
                {errors.placa && <span className="error-message">{errors.placa}</span>}
              </div>
              
              <div className="form-group">
                <label>Cliente *</label>
                <select
                  value={newVehiculo.cliente_id}
                  onChange={e => handleClienteChange(parseInt(e.target.value))}
                  className={errors.cliente_id ? 'input-error' : ''}
                  disabled={loading}
                >
                  <option value="0">Seleccione un cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre} ({cliente.cedula})
                    </option>
                  ))}
                </select>
                {errors.cliente_id && <span className="error-message">{errors.cliente_id}</span>}
              </div>
              
              <div className="form-group">
                <label>Modelo de Vehículo *</label>
                <select
                  value={newVehiculo.vehiculo_base_id}
                  onChange={e => setNewVehiculo({ ...newVehiculo, vehiculo_base_id: parseInt(e.target.value) })}
                  className={errors.vehiculo_base_id ? 'input-error' : ''}
                  disabled={loading}
                >
                  <option value="0">Seleccione un modelo</option>
                  {vehiculosBase.map(vb => (
                    <option key={vb.id} value={vb.id}>
                      {vb.marca} {vb.modelo} ({vb.tipo}, {vb.anio})
                    </option>
                  ))}
                </select>
                {errors.vehiculo_base_id && <span className="error-message">{errors.vehiculo_base_id}</span>}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="boton boton-guardar" 
                onClick={agregarVehiculo}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar Vehículo'}
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

      {/* MODAL EDITAR VEHÍCULO */}
      {showModalEditar && selected && (
        <div className="modal-overlay" onClick={() => !loading && setShowModalEditar(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Vehículo</h3>
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
                <label>Placa</label>
                <input
                  value={selected.placa}
                  disabled
                  className="input-disabled"
                />
                <small className="field-info">La placa no se puede modificar</small>
              </div>
              
              <div className="form-group">
                <label>Cliente</label>
                <select
                  value={selected.cliente_id}
                  onChange={e => setSelected({ ...selected, cliente_id: parseInt(e.target.value) })}
                  disabled={loading}
                >
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre} ({cliente.cedula})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Modelo de Vehículo</label>
                <select
                  value={selected.vehiculo_base_id}
                  onChange={e => setSelected({ ...selected, vehiculo_base_id: parseInt(e.target.value) })}
                  disabled={loading}
                >
                  {vehiculosBase.map(vb => (
                    <option key={vb.id} value={vb.id}>
                      {vb.marca} {vb.modelo} ({vb.tipo}, {vb.anio})
                    </option>
                  ))}
                </select>
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

export default Vehiculos;