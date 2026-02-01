// src/pages/Citas.tsx - VERSIÓN CON BUSCADORES MEJORADOS
import React, { useState, useEffect, useCallback } from 'react';
import { citasService, type Cita as CitaServicio } from '../services/citas.service';
import { vehiculoClienteService, type VehiculoClienteCompleto } from '../services/vehiculo_cliente.service';
import { usuarioService, type Usuario as UsuarioServicio } from '../services/usuario.service';
import '../styles/pages/Citas.css';

// Interfaces adaptadas a lo que REALMENTE devuelve el backend
interface CitaBackend {
  id: number;
  vehiculo_cliente_id: number;
  fecha: string;
  hora: string;
  descripcion: string;
  usuario_id: number | null;
  estado: string;
  created_at: string;
  updated_at: string;
}

interface Estadisticas {
  total: number;
  en_espera: number;
  aceptadas: number;
  completadas: number;
  canceladas: number;
  hoy: number;
}

// Datos mapeados para mostrar en frontend
interface CitaDisplay {
  id: number;
  vehiculo_cliente_id: number;
  fecha: string;
  hora: string;
  descripcion: string;
  usuario_id: number | null;
  estado: string;
  created_at: string;
  // Datos generados para display
  display_cliente: string;
  display_vehiculo: string;
  display_mecanico: string;
}

// Interface para vehículos de clientes
interface VehiculoClienteDisplay {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  tipo: string;
  cliente_id: number;
  cliente_cedula: string;
  cliente_nombre: string;
  cliente_telefono: string;
}

// Interface para usuarios/empleados
interface UsuarioDisplay {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  telefono?: string;
  especialidad?: string;
}

const Citas: React.FC = () => {
  const [citas, setCitas] = useState<CitaDisplay[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CitaDisplay | null>(null);
  const [showModalAgregar, setShowModalAgregar] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    total: 0,
    en_espera: 0,
    aceptadas: 0,
    completadas: 0,
    canceladas: 0,
    hoy: 0
  });

  // Nueva cita
  const [nuevaCita, setNuevaCita] = useState({
    vehiculo_cliente_id: '',
    fecha: '',
    hora: '',
    descripcion: '',
    estado: 'En Espera',
    usuario_id: ''
  });

  // Estados para el buscador de vehículos
  const [vehiculosCliente, setVehiculosCliente] = useState<VehiculoClienteDisplay[]>([]);
  const [searchVehiculo, setSearchVehiculo] = useState('');
  const [vehiculosFiltrados, setVehiculosFiltrados] = useState<VehiculoClienteDisplay[]>([]);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<VehiculoClienteDisplay | null>(null);

  // Estados para el buscador de usuarios/empleados
  const [usuarios, setUsuarios] = useState<UsuarioDisplay[]>([]);
  const [searchUsuario, setSearchUsuario] = useState('');
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<UsuarioDisplay[]>([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioDisplay | null>(null);

  const [citaEditada, setCitaEditada] = useState<CitaDisplay | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Transformar datos del backend para display
  const transformarCita = (cita: CitaServicio): CitaDisplay => ({
    id: cita.id || 0,
    vehiculo_cliente_id: cita.vehiculo_cliente_id || 0,
    fecha: cita.fecha || '',
    hora: cita.hora || '',
    descripcion: cita.descripcion || '',
    usuario_id: cita.usuario_id || null,
    estado: cita.estado || 'En Espera',
    created_at: cita.created_at || '',
    // Datos generados para mostrar
    display_cliente: `Cliente ${cita.vehiculo_cliente_id}`,
    display_vehiculo: `Vehículo ${cita.vehiculo_cliente_id}`,
    display_mecanico: cita.usuario_id ? `Mecánico ${cita.usuario_id}` : 'Sin Asignar'
  });

  // Transformar datos de vehículos-cliente
  const transformarVehiculoCliente = (vehiculo: VehiculoClienteCompleto): VehiculoClienteDisplay => ({
    id: vehiculo.id || 0,
    placa: vehiculo.placa || '',
    marca: vehiculo.vehiculo_marca || '',
    modelo: vehiculo.vehiculo_modelo || '',
    anio: vehiculo.vehiculo_anio || 0,
    tipo: vehiculo.vehiculo_tipo || '',
    cliente_id: vehiculo.cliente_id || 0,
    cliente_cedula: vehiculo.cliente_cedula || '',
    cliente_nombre: vehiculo.cliente_nombre || '',
    cliente_telefono: vehiculo.cliente_telefono || ''
  });

  // Transformar datos de usuarios
  const transformarUsuario = (usuario: UsuarioServicio): UsuarioDisplay => ({
    id: usuario.id || 0,
    nombre: usuario.nombre || '',
    email: usuario.correo || usuario.correo || '',
    rol: usuario.roles || usuario.roles || ''
  });

  // Cargar citas
  const cargarCitas = useCallback(async (searchTerm?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await citasService.getCitas(searchTerm);
      
      if (response?.success && response.data) {
        const citasTransformadas = Array.isArray(response.data) 
          ? response.data.map(transformarCita)
          : [];
        setCitas(citasTransformadas);
      } else {
        setCitas([]);
      }
    } catch (error: any) {
      console.error('Error cargando citas:', error);
      setError('Error al cargar citas: ' + (error.message || 'Error desconocido'));
      setCitas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar vehículos de clientes
  const cargarVehiculosCliente = async () => {
    try {
      const response = await vehiculoClienteService.getVehiculosClientes();
      
      if (response?.success && response.data) {
        const vehiculosTransformados = Array.isArray(response.data)
          ? response.data.map(transformarVehiculoCliente)
          : [];
        setVehiculosCliente(vehiculosTransformados);
        setVehiculosFiltrados(vehiculosTransformados);
      }
    } catch (error) {
      console.error('Error cargando vehículos:', error);
    }
  };

  // Cargar usuarios/empleados
  const cargarUsuarios = async () => {
    try {
      const response = await usuarioService.getUsuarios();
      
      if (response?.success && response.data) {
        const usuariosTransformados = Array.isArray(response.data)
          ? response.data.map(transformarUsuario)
          : [];
        setUsuarios(usuariosTransformados);
        setUsuariosFiltrados(usuariosTransformados);
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  // Cargar estadísticas
  const cargarEstadisticas = async () => {
    try {
      const response = await citasService.getEstadisticas();
      if (response?.success && response.data) {
        setEstadisticas(response.data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    cargarCitas();
    cargarVehiculosCliente();
    cargarUsuarios();
    cargarEstadisticas();
  }, []);

  // Filtrar vehículos según búsqueda
  useEffect(() => {
    if (searchVehiculo.trim() === '') {
      setVehiculosFiltrados(vehiculosCliente);
    } else {
      const filtrados = vehiculosCliente.filter(v =>
        v.placa.toLowerCase().includes(searchVehiculo.toLowerCase()) ||
        v.marca.toLowerCase().includes(searchVehiculo.toLowerCase()) ||
        v.modelo.toLowerCase().includes(searchVehiculo.toLowerCase()) ||
        v.cliente_nombre.toLowerCase().includes(searchVehiculo.toLowerCase()) ||
        v.cliente_cedula.includes(searchVehiculo)
      );
      setVehiculosFiltrados(filtrados);
    }
  }, [searchVehiculo, vehiculosCliente]);

  // Filtrar usuarios según búsqueda
  useEffect(() => {
    if (searchUsuario.trim() === '') {
      setUsuariosFiltrados(usuarios);
    } else {
      const filtrados = usuarios.filter(u =>
        u.nombre.toLowerCase().includes(searchUsuario.toLowerCase()) ||
        u.email.toLowerCase().includes(searchUsuario.toLowerCase()) ||
        u.rol.toLowerCase().includes(searchUsuario.toLowerCase()) ||
        (u.especialidad && u.especialidad.toLowerCase().includes(searchUsuario.toLowerCase()))
      );
      setUsuariosFiltrados(filtrados);
    }
  }, [searchUsuario, usuarios]);

  // Búsqueda de citas con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      cargarCitas(search || undefined);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, cargarCitas]);

  // Filtrar citas localmente
  const citasFiltradas = citas.filter(c =>
    c.display_cliente.toLowerCase().includes(search.toLowerCase()) ||
    c.display_vehiculo.toLowerCase().includes(search.toLowerCase()) ||
    c.display_mecanico.toLowerCase().includes(search.toLowerCase()) ||
    c.estado.toLowerCase().includes(search.toLowerCase()) ||
    c.descripcion.toLowerCase().includes(search.toLowerCase())
  );

  // Validar formulario
  const validarCita = (cita: typeof nuevaCita): {[key: string]: string} => {
    const newErrors: {[key: string]: string} = {};

    if (!cita.vehiculo_cliente_id.trim()) {
      newErrors.vehiculo_cliente_id = 'Debe seleccionar un vehículo';
    }

    if (!cita.fecha.trim()) {
      newErrors.fecha = 'La fecha es obligatoria';
    } else {
      const fechaCita = new Date(cita.fecha);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaCita < hoy) {
        newErrors.fecha = 'No se pueden agendar citas en fechas pasadas';
      }
    }

    if (!cita.hora.trim()) {
      newErrors.hora = 'La hora es obligatoria';
    }

    if (!cita.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    }

    return newErrors;
  };

  // Manejar selección de vehículo
  const manejarSeleccionVehiculo = (vehiculoId: number) => {
    const vehiculo = vehiculosCliente.find(v => v.id === vehiculoId);
    if (vehiculo) {
      setVehiculoSeleccionado(vehiculo);
      setNuevaCita({
        ...nuevaCita,
        vehiculo_cliente_id: vehiculo.id.toString()
      });
    }
  };

  // Manejar selección de usuario
  const manejarSeleccionUsuario = (usuarioId: number) => {
    const usuario = usuarios.find(u => u.id === usuarioId);
    if (usuario) {
      setUsuarioSeleccionado(usuario);
      setNuevaCita({
        ...nuevaCita,
        usuario_id: usuario.id.toString()
      });
    }
  };

  // Agregar cita
  const agregarCita = async () => {
    const validationErrors = validarCita(nuevaCita);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      
      // Verificar disponibilidad
      const disponibilidadResponse = await citasService.checkDisponibilidad({
        vehiculoClienteId: parseInt(nuevaCita.vehiculo_cliente_id),
        fecha: nuevaCita.fecha,
        hora: nuevaCita.hora
      });

      if (!disponibilidadResponse.data?.vehiculoClienteDisponible) {
        alert('El vehículo-cliente ya tiene una cita programada en esa fecha y hora');
        return;
      }

      // Crear la cita con todos los campos requeridos
      const citaData = {
        vehiculo_cliente_id: parseInt(nuevaCita.vehiculo_cliente_id),
        fecha: nuevaCita.fecha,
        hora: nuevaCita.hora,
        descripcion: nuevaCita.descripcion,
        estado: nuevaCita.estado,
        usuario_id: nuevaCita.usuario_id ? parseInt(nuevaCita.usuario_id) : null
      };

      const response = await citasService.createCita(citaData);
      
      if (response?.success) {
        await cargarCitas();
        await cargarEstadisticas();
        
        // Resetear formulario
        setNuevaCita({
          vehiculo_cliente_id: '',
          fecha: '',
          hora: '',
          descripcion: '',
          estado: 'En Espera',
          usuario_id: ''
        });
        setVehiculoSeleccionado(null);
        setUsuarioSeleccionado(null);
        setSearchVehiculo('');
        setSearchUsuario('');
        
        setErrors({});
        setShowModalAgregar(false);
        alert('Cita agendada exitosamente');
      }
    } catch (error: any) {
      console.error('Error creando cita:', error);
      alert('Error: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Editar cita
  const guardarEdicion = async () => {
    if (!citaEditada) return;

    const validationErrors = validarCita({
      vehiculo_cliente_id: citaEditada.vehiculo_cliente_id.toString(),
      fecha: citaEditada.fecha,
      hora: citaEditada.hora,
      descripcion: citaEditada.descripcion,
      estado: citaEditada.estado,
      usuario_id: citaEditada.usuario_id?.toString() || ''
    });
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      
      // Verificar disponibilidad si se cambian datos críticos
      if ((citaEditada.fecha !== selected?.fecha || 
           citaEditada.hora !== selected?.hora || 
           citaEditada.vehiculo_cliente_id !== selected?.vehiculo_cliente_id)) {
        
        const disponibilidadResponse = await citasService.checkDisponibilidad({
          vehiculoClienteId: citaEditada.vehiculo_cliente_id,
          fecha: citaEditada.fecha,
          hora: citaEditada.hora,
          excludeId: citaEditada.id
        });

        if (!disponibilidadResponse.data?.vehiculoClienteDisponible) {
          alert('Ya existe otra cita en esa fecha y hora');
          return;
        }
      }

      // Actualizar la cita con todos los campos requeridos
      const updateData = {
        fecha: citaEditada.fecha,
        hora: citaEditada.hora,
        descripcion: citaEditada.descripcion,
        estado: citaEditada.estado,
        usuario_id: citaEditada.usuario_id
      };

      const response = await citasService.updateCita(citaEditada.id, updateData);
      
      if (response?.success) {
        await cargarCitas();
        await cargarEstadisticas();
        
        setErrors({});
        setShowModalEditar(false);
        setCitaEditada(null);
        alert('Cita actualizada exitosamente');
      }
    } catch (error: any) {
      console.error('Error actualizando cita:', error);
      alert('Error: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado
  const cambiarEstado = async (id: number, nuevoEstado: string) => {
    if (nuevoEstado === 'Cancelada' && !confirm('¿Cancelar esta cita?')) return;

    try {
      setLoading(true);
      const response = await citasService.updateEstadoCita(id, nuevoEstado);
      
      if (response?.success) {
        await cargarCitas();
        await cargarEstadisticas();
        
        if (selected && selected.id === id) {
          setSelected(transformarCita(response.data!));
        }
        
        alert(`Cita ${nuevoEstado.toLowerCase()} exitosamente`);
      }
    } catch (error: any) {
      console.error('Error cambiando estado:', error);
      alert('Error: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Eliminar cita
  const eliminarCita = async (id: number) => {
    if (!confirm('¿Eliminar esta cita permanentemente?')) return;

    try {
      setLoading(true);
      const response = await citasService.deleteCita(id);
      
      if (response?.success) {
        await cargarCitas();
        await cargarEstadisticas();
        setSelected(null);
        alert('Cita eliminada exitosamente');
      }
    } catch (error: any) {
      console.error('Error eliminando cita:', error);
      alert('Error: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Colores para estados
  const estadoColors: {[key: string]: string} = {
    'En Espera': '#ffd700',
    'Aceptada': '#4caf50',
    'Completada': '#2196f3',
    'Cancelada': '#f44336'
  };

  return (
    <div className="gestion-citas">
      <div className="header-section">
        <div className="stats">
          <span className="stat-item">Total: {estadisticas.total} citas</span>
          <span className="stat-item">Mostrando: {citasFiltradas.length}</span>
          <span className="stat-item">En Espera: {estadisticas.en_espera}</span>
          {loading && <span className="stat-item loading">Cargando...</span>}
          {error && <span className="stat-item error">{error}</span>}
        </div>
      </div>

      <div className="contenedor-principal">
        <div className="contenedor-lista">
          <div className="busqueda-agregar">
            <input
              className="search-bar"
              placeholder="Buscar por cliente, vehículo, mecánico o estado..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              disabled={loading}
            />
            <button
              className="boton boton-agregar boton-grande"
              onClick={() => {
                setShowModalAgregar(true);
                cargarVehiculosCliente();
                cargarUsuarios();
              }}
              disabled={loading}
            >
              <span className="icono">+</span>
              Nueva Cita
            </button>
          </div>

          <div className="table-container">
            {loading && citas.length === 0 ? (
              <div className="loading">Cargando citas...</div>
            ) : error ? (
              <div className="error-message">Error: {error}</div>
            ) : (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Vehículo</th>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Mecánico</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {citasFiltradas.map((cita) => (
                      <tr 
                        key={cita.id}
                        className={selected?.id === cita.id ? 'selected-row' : ''}
                        onClick={() => setSelected(cita)}
                      >
                        <td>{cita.display_cliente}</td>
                        <td className="placa-column">{cita.display_vehiculo}</td>
                        <td>{new Date(cita.fecha).toLocaleDateString('es-ES')}</td>
                        <td>{cita.hora}</td>
                        <td>{cita.display_mecanico}</td>
                        <td>
                          <span 
                            className="estado-badge"
                            style={{ backgroundColor: estadoColors[cita.estado] || '#ccc' }}
                          >
                            {cita.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {citasFiltradas.length === 0 && !loading && (
                  <div className="no-results">
                    {search ? 'No se encontraron citas' : 'No hay citas registradas'}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {selected && !showModalEditar && (
          <div className="contenedor-detalles">
            <div className="sidebar-details">
              <div className="sidebar-header">
                <h4>Detalles de la Cita #{selected.id}</h4>
                <button 
                  className="btn-close" 
                  onClick={() => setSelected(null)}
                  disabled={loading}
                >
                  ×
                </button>
              </div>
              
              <div className="sidebar-body">
                <div className="detail-item">
                  <span className="detail-label">ID:</span>
                  <span className="detail-value">{selected.id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Vehículo-Cliente ID:</span>
                  <span className="detail-value">{selected.vehiculo_cliente_id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Fecha:</span>
                  <span className="detail-value">{new Date(selected.fecha).toLocaleDateString('es-ES')}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Hora:</span>
                  <span className="detail-value">{selected.hora}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Usuario ID:</span>
                  <span className="detail-value">{selected.usuario_id || 'Sin asignar'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Estado:</span>
                  <span 
                    className="detail-value estado-badge"
                    style={{ backgroundColor: estadoColors[selected.estado] || '#ccc' }}
                  >
                    {selected.estado}
                  </span>
                </div>
                <div className="detail-item full-width">
                  <span className="detail-label">Descripción:</span>
                  <div className="detail-value descripcion-text">{selected.descripcion}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Creada:</span>
                  <span className="detail-value">{new Date(selected.created_at).toLocaleString('es-ES')}</span>
                </div>
              </div>
              
              <div className="sidebar-footer">
                <div className="estado-actions">
                  {selected.estado === 'En Espera' && (
                    <button 
                      className="boton boton-cancelar"
                      onClick={() => cambiarEstado(selected.id, 'Cancelada')}
                      disabled={loading}
                    >
                      Cancelar Cita
                    </button>
                  )}
                  
                  {selected.estado === 'Aceptada' && (
                    <button 
                      className="boton boton-completar"
                      onClick={() => cambiarEstado(selected.id, 'Completada')}
                      disabled={loading}
                    >
                      Marcar como Completada
                    </button>
                  )}
                  
                  <button 
                    className="boton boton-editar"
                    onClick={() => {
                      setCitaEditada(selected);
                      setShowModalEditar(true);
                      setErrors({});
                    }}
                    disabled={loading}
                  >
                    Editar Cita
                  </button>
                  
                  <button 
                    className="boton boton-eliminar"
                    onClick={() => eliminarCita(selected.id)}
                    disabled={selected.estado !== 'Cancelada' || loading}
                    title={selected.estado !== 'Cancelada' ? 'Solo se pueden eliminar citas canceladas' : ''}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL AGREGAR CITA - CON BUSCADORES MEJORADOS */}
      {showModalAgregar && (
        <div className="modal-overlay" onClick={() => !loading && setShowModalAgregar(false)}>
          <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agendar Nueva Cita</h3>
              <button 
                className="btn-close" 
                onClick={() => !loading && setShowModalAgregar(false)}
                disabled={loading}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {/* SECCIÓN DE VEHÍCULOS */}
              <div className="form-section">
                <h4 className="section-title">1. Seleccionar Vehículo</h4>
                <div className="form-group">
                  <label>Buscar Vehículo *</label>
                  <input
                    placeholder="Buscar por placa, marca, modelo o cliente..."
                    value={searchVehiculo}
                    onChange={e => setSearchVehiculo(e.target.value)}
                    className="search-bar"
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label>Lista de Vehículos</label>
                  <div className="selectable-list">
                    {vehiculosFiltrados.length === 0 ? (
                      <div className="no-results">
                        {searchVehiculo ? 'No se encontraron vehículos' : 'Cargando vehículos...'}
                      </div>
                    ) : (
                      <div className="items-grid">
                        {vehiculosFiltrados.map(vehiculo => (
                          <div 
                            key={vehiculo.id}
                            className={`list-item ${vehiculoSeleccionado?.id === vehiculo.id ? 'selected' : ''}`}
                            onClick={() => manejarSeleccionVehiculo(vehiculo.id)}
                          >
                            <div className="item-content">
                              <div className="item-title">{vehiculo.placa}</div>
                              <div className="item-subtitle">{vehiculo.marca} {vehiculo.modelo} ({vehiculo.anio})</div>
                              <div className="item-info">
                                <span className="info-tag">{vehiculo.tipo}</span>
                                <span className="info-text">Cliente: {vehiculo.cliente_nombre}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.vehiculo_cliente_id && <span className="error-message">{errors.vehiculo_cliente_id}</span>}
                </div>
                
                {vehiculoSeleccionado && (
                  <div className="selected-info">
                    <div className="selected-badge">
                      <span className="badge-icon">✓</span>
                      <span className="badge-text">Vehículo seleccionado: <strong>{vehiculoSeleccionado.placa}</strong> - {vehiculoSeleccionado.marca} {vehiculoSeleccionado.modelo}</span>
                    </div>
                    <div className="selected-details">
                      <p><strong>Cliente:</strong> {vehiculoSeleccionado.cliente_nombre}</p>
                      <p><strong>Cédula:</strong> {vehiculoSeleccionado.cliente_cedula}</p>
                      <p><strong>Teléfono:</strong> {vehiculoSeleccionado.cliente_telefono}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* SECCIÓN DE USUARIOS/EMPLEADOS */}
              <div className="form-section">
                <h4 className="section-title">2. Asignar Mecánico (Opcional)</h4>
                <div className="form-group">
                  <label>Buscar Mecánico</label>
                  <input
                    placeholder="Buscar por nombre, email o especialidad..."
                    value={searchUsuario}
                    onChange={e => setSearchUsuario(e.target.value)}
                    className="search-bar"
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label>Lista de Mecánicos</label>
                  <div className="selectable-list">
                    {usuariosFiltrados.length === 0 ? (
                      <div className="no-results">
                        {searchUsuario ? 'No se encontraron mecánicos' : 'Cargando mecánicos...'}
                      </div>
                    ) : (
                      <div className="items-grid">
                        {usuariosFiltrados.map(usuario => (
                          <div 
                            key={usuario.id}
                            className={`list-item ${usuarioSeleccionado?.id === usuario.id ? 'selected' : ''}`}
                            onClick={() => manejarSeleccionUsuario(usuario.id)}
                          >
                            <div className="item-icon">👨‍🔧</div>
                            <div className="item-content">
                              <div className="item-title">{usuario.nombre}</div>
                              <div className="item-subtitle">{usuario.email}</div>
                              <div className="item-info">
                                <span className="info-tag">{usuario.rol}</span>
                                {usuario.especialidad && (
                                  <span className="info-text">Especialidad: {usuario.especialidad}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {usuarioSeleccionado && (
                  <div className="selected-info">
                    <div className="selected-badge">
                      <span className="badge-icon">✓</span>
                      <span className="badge-text">Mecánico asignado: <strong>{usuarioSeleccionado.nombre}</strong></span>
                    </div>
                  </div>
                )}
              </div>

              {/* SECCIÓN DE DETALLES DE LA CITA */}
              <div className="form-section">
                <h4 className="section-title">3. Detalles de la Cita</h4>
                <div className="form-row">
                  <div className="form-group half">
                    <label>Fecha *</label>
                    <input
                      type="date"
                      value={nuevaCita.fecha}
                      onChange={e => setNuevaCita({ ...nuevaCita, fecha: e.target.value })}
                      className={errors.fecha ? 'input-error' : ''}
                      min={new Date().toISOString().split('T')[0]}
                      disabled={loading}
                    />
                    {errors.fecha && <span className="error-message">{errors.fecha}</span>}
                  </div>
                  
                  <div className="form-group half">
                    <label>Hora *</label>
                    <input
                      type="time"
                      value={nuevaCita.hora}
                      onChange={e => setNuevaCita({ ...nuevaCita, hora: e.target.value })}
                      className={errors.hora ? 'input-error' : ''}
                      disabled={loading}
                    />
                    {errors.hora && <span className="error-message">{errors.hora}</span>}
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Descripción del Servicio *</label>
                  <textarea
                    placeholder="Describa detalladamente el servicio requerido..."
                    value={nuevaCita.descripcion}
                    onChange={e => setNuevaCita({ ...nuevaCita, descripcion: e.target.value })}
                    className={errors.descripcion ? 'input-error' : ''}
                    rows={4}
                    disabled={loading}
                  />
                  {errors.descripcion && <span className="error-message">{errors.descripcion}</span>}
                  <div className="field-info">Mínimo 10 caracteres</div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="boton boton-guardar" onClick={agregarCita} disabled={loading || !vehiculoSeleccionado}>
                {loading ? 'Agendando...' : 'Agendar Cita'}
              </button>
              <button className="boton boton-cancelar" onClick={() => setShowModalAgregar(false)} disabled={loading}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR CITA */}
      {showModalEditar && citaEditada && (
        <div className="modal-overlay" onClick={() => !loading && setShowModalEditar(false)}>
          <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Cita #{citaEditada.id}</h3>
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
                <label>Vehículo-Cliente ID</label>
                <input
                  value={citaEditada.vehiculo_cliente_id}
                  disabled
                  className="input-disabled"
                />
              </div>
              
              <div className="form-group">
                <label>Fecha *</label>
                <input
                  type="date"
                  value={citaEditada.fecha}
                  onChange={e => setCitaEditada({ ...citaEditada, fecha: e.target.value })}
                  className={errors.fecha ? 'input-error' : ''}
                  min={new Date().toISOString().split('T')[0]}
                  disabled={loading}
                />
                {errors.fecha && <span className="error-message">{errors.fecha}</span>}
              </div>
              
              <div className="form-group">
                <label>Hora *</label>
                <input
                  type="time"
                  value={citaEditada.hora}
                  onChange={e => setCitaEditada({ ...citaEditada, hora: e.target.value })}
                  className={errors.hora ? 'input-error' : ''}
                  disabled={loading}
                />
                {errors.hora && <span className="error-message">{errors.hora}</span>}
              </div>
              
              <div className="form-group">
                <label>Usuario ID</label>
                <input
                  type="number"
                  placeholder="ID del mecánico"
                  value={citaEditada.usuario_id || ''}
                  onChange={e => setCitaEditada({ 
                    ...citaEditada, 
                    usuario_id: e.target.value ? parseInt(e.target.value) : null 
                  })}
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>Estado</label>
                <select
                  value={citaEditada.estado}
                  onChange={e => setCitaEditada({ ...citaEditada, estado: e.target.value })}
                  disabled={loading}
                >
                  <option value="En Espera">En Espera</option>
                  <option value="Aceptada">Aceptada</option>
                  <option value="Completada">Completada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Descripción *</label>
                <textarea
                  value={citaEditada.descripcion}
                  onChange={e => setCitaEditada({ ...citaEditada, descripcion: e.target.value })}
                  className={errors.descripcion ? 'input-error' : ''}
                  rows={4}
                  disabled={loading}
                />
                {errors.descripcion && <span className="error-message">{errors.descripcion}</span>}
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="boton boton-guardar" onClick={guardarEdicion} disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button className="boton boton-cancelar" onClick={() => setShowModalEditar(false)} disabled={loading}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Citas;