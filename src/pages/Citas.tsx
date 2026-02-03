// src/pages/Citas.tsx
import React, { useState, useEffect } from 'react';
import '../styles/pages/Citas.css';
import { citaService } from '../services/cita.service';
import { fetchApi } from '../services/api';
import { useToast } from '../components/ToastContainer';

interface Cita {
  id: number;
  vehiculo_cliente_id: number;
  cliente_cedula?: string;
  cliente_nombre?: string;
  vehiculo_placa?: string;
  fecha: string;
  hora: string;
  descripcion: string;
  usuario_id?: number | null;
  mecanico_nombre?: string;
  estado: 'En Espera' | 'Aceptada' | 'Cancelada' | 'Completada';
  vehiculo_marca?: string;
  vehiculo_modelo?: string;
}

interface Vehiculo {
  id: number;
  placa: string;
  marca?: string;
  modelo?: string;
  cliente_id?: number;
  cliente_nombre?: string;
  cliente_cedula?: string;
}

interface Usuario {
  id: number;
  nombre: string;
  rol?: string;
  correo?: string;
}

const Citas: React.FC = () => {
  const { showToast } = useToast();
  
  // Mapeo de estados BD <-> Frontend
  const mapEstadoFromDB = (estadoDB: string): Cita['estado'] => {
    const map: Record<string, Cita['estado']> = {
      'pendiente': 'En Espera',
      'aceptada': 'Aceptada',
      'rechazada': 'Cancelada',
      'completada': 'Completada'
    };
    return map[estadoDB.toLowerCase()] || 'En Espera';
  };

  const mapEstadoToDB = (estadoFrontend: Cita['estado']): string => {
    const map: Record<Cita['estado'], string> = {
      'En Espera': 'pendiente',
      'Aceptada': 'aceptada',
      'Cancelada': 'rechazada',
      'Completada': 'completada'
    };
    return map[estadoFrontend];
  };

  // Normalizar formato de hora a HH:MM:SS
  const normalizarHora = (hora: string): string => {
    if (!hora) return '';
    // Si ya tiene formato HH:MM:SS, devolverla tal cual
    if (hora.length === 8 && hora.split(':').length === 3) {
      return hora;
    }
    // Si tiene formato HH:MM, agregar :00
    if (hora.length === 5 && hora.split(':').length === 2) {
      return hora + ':00';
    }
    // Si no coincide con ningún formato, intentar limpiar
    const partes = hora.split(':');
    if (partes.length >= 2) {
      const hh = partes[0].padStart(2, '0');
      const mm = partes[1].padStart(2, '0');
      const ss = partes[2] ? partes[2].padStart(2, '0') : '00';
      return `${hh}:${mm}:${ss}`;
    }
    return hora + ':00';
  };
  
  // Estado para la lista de citas
  const [citas, setCitas] = useState<Cita[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [mecanicos, setMecanicos] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados para búsqueda y selección
  const [search, setSearch] = useState('');
  const [searchVehiculo, setSearchVehiculo] = useState('');
  const [selected, setSelected] = useState<Cita | null>(null);
  const [showModalAgregar, setShowModalAgregar] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showModalAsignar, setShowModalAsignar] = useState(false);
  const [showModalConfirmacion, setShowModalConfirmacion] = useState(false);

  // Estados para formularios
  const [nuevaCita, setNuevaCita] = useState({
    vehiculo_cliente_id: 0,
    fecha: '',
    hora: '',
    descripcion: '',
    usuario_id: null as number | null,
    estado: 'En Espera' as const
  });

  const [citaEditada, setCitaEditada] = useState<Cita | null>(null);
  const [mecanicoSeleccionado, setMecanicoSeleccionado] = useState('');
  
  // Estados para validación
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [vehiculoConCita, setVehiculoConCita] = useState<{vehiculo: Vehiculo, cita: Cita} | null>(null);

  // Cargar datos desde la API
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar citas
      const citasRes = await citaService.getCitas();
      if (citasRes.success && citasRes.data) {
        const citasMapeadas = (citasRes.data as unknown as any[]).map(cita => ({
          ...cita,
          estado: mapEstadoFromDB(cita.estado)
        }));
        setCitas(citasMapeadas as Cita[]);
      }

      // Cargar vehículos de clientes con autenticación
      const vehiculosRes = await fetchApi<Vehiculo[]>('/vehiculos-clientes');
      if (vehiculosRes.success && vehiculosRes.data) {
        setVehiculos(vehiculosRes.data);
      }

      // Cargar usuarios (mecánicos) con autenticación
      const usuariosRes = await fetchApi<Usuario[]>('/usuarios');
      if (usuariosRes.success && usuariosRes.data) {
        const mecanicosList = usuariosRes.data.filter((u: Usuario) => 
          u.rol === 'mecanico' || u.rol === 'admin'
        );
        setMecanicos(mecanicosList);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      showToast('Error al cargar datos. Intenta nuevamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar citas
  const citasFiltradas = citas.filter(c =>
    (c.cliente_nombre?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (c.vehiculo_placa?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (c.mecanico_nombre?.toLowerCase() || '').includes(search.toLowerCase()) ||
    c.estado.toLowerCase().includes(search.toLowerCase())
  );

  // Filtrar vehículos para búsqueda
  const vehiculosFiltrados = vehiculos.filter(v =>
    v.placa.toLowerCase().includes(searchVehiculo.toLowerCase()) ||
    (v.marca?.toLowerCase() || '').includes(searchVehiculo.toLowerCase()) ||
    (v.cliente_nombre?.toLowerCase() || '').includes(searchVehiculo.toLowerCase())
  );

  // Verificar si un vehículo ya tiene cita
  const verificarCitaExistente = (vehiculo_id: number): Cita | null => {
    return citas.find(c => 
      c.vehiculo_cliente_id === vehiculo_id && 
      c.estado !== 'Cancelada' && 
      c.estado !== 'Completada'
    ) || null;
  };

  /* === VALIDAR FORMULARIO === */
  const validarCita = (cita: typeof nuevaCita | Cita): {[key: string]: string} => {
    const newErrors: {[key: string]: string} = {};

    const vehiculoId = 'vehiculo_cliente_id' in cita ? cita.vehiculo_cliente_id : 0;
    if (!vehiculoId || vehiculoId === 0) {
      newErrors.vehiculo_cliente_id = 'El vehículo es obligatorio';
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
    } else {
      const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
      if (!horaRegex.test(cita.hora)) {
        newErrors.hora = 'Formato de hora inválido (HH:MM)';
      }
    }

    if (!cita.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    } else if (cita.descripcion.trim().length < 5) {
      newErrors.descripcion = 'La descripción debe tener al menos 5 caracteres';
    }

    return newErrors;
  };

  /* === MANEJAR SELECCIÓN DE VEHÍCULO === */
  const manejarSeleccionVehiculo = (vehiculoId: number) => {
    const vehiculo = vehiculos.find(v => v.id === vehiculoId);
    if (!vehiculo) return;

    // Verificar si ya tiene cita activa
    const citaExistente = verificarCitaExistente(vehiculoId);
    
    if (citaExistente) {
      setVehiculoConCita({ vehiculo, cita: citaExistente });
      setShowModalConfirmacion(true);
    } else {
      // Actualizar datos del cliente en el formulario
      setNuevaCita({
        ...nuevaCita,
        vehiculo_cliente_id: vehiculo.id
      });
    }
  };

  /* === CONFIRMAR REEMPLAZO DE CITA === */
  const confirmarReemplazo = async () => {
    if (!vehiculoConCita) return;

    try {
      // Cancelar cita existente
      await citaService.updateEstado(vehiculoConCita.cita.id, 'Cancelada');

      // Proceder con la nueva cita
      setNuevaCita({
        ...nuevaCita,
        vehiculo_cliente_id: vehiculoConCita.vehiculo.id
      });

      setShowModalConfirmacion(false);
      setVehiculoConCita(null);
      await cargarDatos(); // Recargar datos
    } catch (error) {
      console.error('Error cancelando cita:', error);
      showToast('Error al cancelar cita existente', 'error');
    }
  };

  /* === AGREGAR CITA === */
  const agregarCita = async () => {
    const validationErrors = validarCita(nuevaCita);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await citaService.createCita({
        ...nuevaCita,
        estado: mapEstadoToDB(nuevaCita.estado) as any
      });
      
      // Limpiar formulario
      setNuevaCita({
        vehiculo_cliente_id: 0,
        fecha: '',
        hora: '',
        descripcion: '',
        usuario_id: null,
        estado: 'En Espera'
      });
      
      setErrors({});
      setShowModalAgregar(false);
      showToast('Cita agendada exitosamente', 'success');
      
      // Recargar datos
      await cargarDatos();
    } catch (error) {
      console.error('Error creando cita:', error);
      showToast('Error al crear cita. Intenta nuevamente.', 'error');
    }
  };

  /* === EDITAR CITA === */
  const guardarEdicion = async () => {
    if (!citaEditada) return;

    const validationErrors = validarCita(citaEditada);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const horaNormalizada = normalizarHora(citaEditada.hora);
      
      await citaService.updateCita(citaEditada.id, {
        vehiculo_cliente_id: citaEditada.vehiculo_cliente_id,
        fecha: citaEditada.fecha,
        hora: horaNormalizada,
        descripcion: citaEditada.descripcion,
        estado: mapEstadoToDB(citaEditada.estado) as any
      });
      
      setErrors({});
      setShowModalEditar(false);
      setCitaEditada(null);
      showToast('Cita actualizada exitosamente', 'success');
      
      // Recargar datos
      await cargarDatos();
    } catch (error) {
      console.error('Error actualizando cita:', error);
      showToast('Error al actualizar cita. Intenta nuevamente.', 'error');
    }
  };

  /* === ASIGNAR MECÁNICO === */
  const asignarMecanico = async () => {
    if (!selected || !mecanicoSeleccionado) {
      showToast('Seleccione un mecánico', 'warning');
      return;
    }

    try {
      await citaService.asignarMecanico(selected.id, Number(mecanicoSeleccionado));
      
      setShowModalAsignar(false);
      setMecanicoSeleccionado('');
      showToast('Mecánico asignado exitosamente', 'success');
      
      // Recargar datos
      await cargarDatos();
    } catch (error) {
      console.error('Error asignando mecánico:', error);
      showToast('Error al asignar mecánico. Intenta nuevamente.', 'error');
    }
  };

  /* === CAMBIAR ESTADO === */
  const cambiarEstado = async (id: number, nuevoEstado: Cita['estado']) => {
    if (nuevoEstado === 'Cancelada') {
      if (!confirm('¿Está seguro de cancelar esta cita?')) return;
    }

    try {
      await citaService.updateEstado(id, mapEstadoToDB(nuevoEstado) as any);
      
      if (selected?.id === id) {
        setSelected({ ...selected, estado: nuevoEstado });
      }
      
      showToast('Estado actualizado exitosamente', 'success');
      await cargarDatos();
    } catch (error) {
      console.error('Error actualizando estado:', error);
      showToast('Error al actualizar estado', 'error');
    }
  };

  /* === ELIMINAR CITA === */
  const eliminarCita = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar esta cita permanentemente?')) return;

    try {
      await citaService.deleteCita(id);
      setSelected(null);
      showToast('Cita eliminada', 'success');
      await cargarDatos();
    } catch (error) {
      console.error('Error eliminando cita:', error);
      showToast('Error al eliminar cita', 'error');
    }
  };

  /* === LIMPIAR ERRORES === */
  const limpiarErrores = () => {
    setErrors({});
  };

  /* === OPCIONES DE ESTADO === */
  const opcionesEstado = [
    { value: 'En Espera', label: 'En Espera', color: '#ffd700' },
    { value: 'Aceptada', label: 'Aceptada', color: '#4caf50' },
    { value: 'Completada', label: 'Completada', color: '#2196f3' },
    { value: 'Cancelada', label: 'Cancelada', color: '#f44336' }
  ];

  return (
    <div className="gestion-citas">
      <div className="header-section">
        <div className="stats">
          <span className="stat-item">Total: {citas.length} citas</span>
          <span className="stat-item">Mostrando: {citasFiltradas.length}</span>
          <span className="stat-item">En Espera: {citas.filter(c => c.estado === 'En Espera').length}</span>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL CON LISTA Y DETALLES */}
      <div className="contenedor-principal">
        {/* CONTENEDOR IZQUIERDO - LISTA DE CITAS */}
        <div className="contenedor-lista">
          {/* BARRA DE BÚSQUEDA Y BOTÓN */}
          <div className="busqueda-agregar">
            <input
              className="search-bar"
              placeholder="Buscar por cliente, vehículo, mecánico o estado..."
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
              Nueva Cita
            </button>
          </div>

          {/* TABLA DE CITAS CON SCROLL */}
          <div className="table-container">
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
                {loading ? (
                  <tr><td colSpan={6} style={{textAlign: 'center'}}>Cargando...</td></tr>
                ) : citasFiltradas.length === 0 ? (
                  <tr><td colSpan={6} style={{textAlign: 'center'}}>No hay citas</td></tr>
                ) : (
                  citasFiltradas.map((cita) => (
                    <tr 
                      key={cita.id}
                      className={selected?.id === cita.id ? 'selected-row' : ''}
                      onClick={() => setSelected(cita)}
                    >
                      <td>{cita.cliente_nombre || 'N/A'}</td>
                      <td className="placa-column">{cita.vehiculo_placa || 'N/A'}</td>
                      <td>{new Date(cita.fecha).toLocaleDateString('es-ES')}</td>
                      <td>{cita.hora.substring(0, 5)}</td>
                      <td>{cita.mecanico_nombre || 'Sin Asignar'}</td>
                      <td>
                        <span 
                          className="estado-badge"
                          style={{
                            backgroundColor: opcionesEstado.find(o => o.value === cita.estado)?.color || '#ccc'
                          }}
                        >
                          {cita.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            {citasFiltradas.length === 0 && (
              <div className="no-results">
                {search ? 'No se encontraron citas' : 'No hay citas registradas'}
              </div>
            )}
          </div>
        </div>

        {/* CONTENEDOR DERECHO - DETALLES DE LA CITA SELECCIONADA */}
        {selected && !showModalEditar && !showModalAsignar && (
          <div className="contenedor-detalles">
            <div className="sidebar-details">
              <div className="sidebar-header">
                <h4>Detalles de la Cita</h4>
                <button 
                  className="btn-close" 
                  onClick={() => setSelected(null)}
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
                  <span className="detail-label">Cliente:</span>
                  <span className="detail-value">{selected.cliente_nombre}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Cédula:</span>
                  <span className="detail-value">{selected.cliente_cedula}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Vehículo:</span>
                  <span className="detail-value placa-value">{selected.vehiculo_placa} - {selected.vehiculo_marca} {selected.vehiculo_modelo}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Fecha:</span>
                  <span className="detail-value">{new Date(selected.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Hora:</span>
                  <span className="detail-value">{selected.hora.substring(0, 5)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Mecánico:</span>
                  <span className="detail-value">{selected.mecanico_nombre || 'Sin Asignar'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Estado:</span>
                  <span 
                    className="detail-value estado-badge"
                    style={{
                      backgroundColor: opcionesEstado.find(o => o.value === selected.estado)?.color || '#ccc'
                    }}
                  >
                    {selected.estado}
                  </span>
                </div>
                <div className="detail-item full-width">
                  <span className="detail-label">Descripción:</span>
                  <div className="detail-value descripcion-text">{selected.descripcion}</div>
                </div>
              </div>
              
              <div className="sidebar-footer">
                <div className="estado-actions">
                  {selected.estado === 'En Espera' && (
                    <>
                      <button 
                        className="boton boton-aceptar"
                        onClick={() => setShowModalAsignar(true)}
                      >
                        Asignar Mecánico
                      </button>
                      <button 
                        className="boton boton-cancelar"
                        onClick={() => cambiarEstado(selected.id, 'Cancelada')}
                      >
                        Cancelar Cita
                      </button>
                    </>
                  )}
                  
                  {selected.estado === 'Aceptada' && (
                    <>
                      <button 
                        className="boton boton-completar"
                        onClick={() => cambiarEstado(selected.id, 'Completada')}
                      >
                        Marcar como Completada
                      </button>
                      <button 
                        className="boton boton-cancelar"
                        onClick={() => cambiarEstado(selected.id, 'Cancelada')}
                      >
                        Cancelar Cita
                      </button>
                    </>
                  )}
                  
                  <button 
                    className="boton boton-editar"
                    onClick={() => {
                      // Normalizar fecha al formato YYYY-MM-DD para el input date
                      const fechaNormalizada = selected.fecha.split('T')[0];
                      setCitaEditada({
                        ...selected,
                        fecha: fechaNormalizada
                      });
                      setShowModalEditar(true);
                      limpiarErrores();
                    }}
                  >
                    Editar Cita
                  </button>
                  
                  <button 
                    className="boton boton-eliminar"
                    onClick={() => eliminarCita(selected.id)}
                    disabled={selected.estado !== 'Cancelada'}
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

      {/* MODAL AGREGAR CITA */}
      {showModalAgregar && (
        <div className="modal-overlay" onClick={() => {
          setShowModalAgregar(false);
          limpiarErrores();
        }}>
          <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agendar Nueva Cita</h3>
              <button 
                className="btn-close" 
                onClick={() => setShowModalAgregar(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Buscar Vehículo *</label>
                <input
                  placeholder="Buscar por placa, marca o cliente..."
                  value={searchVehiculo}
                  onChange={e => setSearchVehiculo(e.target.value)}
                  className="search-bar"
                />
              </div>
              
              <div className="form-group">
                <label>Seleccionar Vehículo *</label>
                <select
                  value={nuevaCita.vehiculo_cliente_id}
                  onChange={e => manejarSeleccionVehiculo(Number(e.target.value))}
                  className={errors.vehiculo_cliente_id ? 'input-error' : ''}
                >
                  <option value="0">Seleccione un vehículo</option>
                  {vehiculosFiltrados.map(vehiculo => (
                    <option key={vehiculo.id} value={vehiculo.id}>
                      {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo} ({vehiculo.cliente_nombre})
                    </option>
                  ))}
                </select>
                {errors.vehiculo_cliente_id && <span className="error-message">{errors.vehiculo_cliente_id}</span>}
              </div>
              
              <div className="form-group">
                <label>Fecha *</label>
                <input
                  type="date"
                  value={nuevaCita.fecha}
                  onChange={e => setNuevaCita({ ...nuevaCita, fecha: e.target.value })}
                  className={errors.fecha ? 'input-error' : ''}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.fecha && <span className="error-message">{errors.fecha}</span>}
              </div>
              
              <div className="form-group">
                <label>Hora *</label>
                <input
                  type="time"
                  value={nuevaCita.hora.substring(0, 5)}
                  onChange={e => setNuevaCita({ ...nuevaCita, hora: e.target.value + ':00' })}
                  className={errors.hora ? 'input-error' : ''}
                  min="08:00"
                  max="18:00"
                />
                {errors.hora && <span className="error-message">{errors.hora}</span>}
              </div>
              
              <div className="form-group">
                <label>Descripción *</label>
                <textarea
                  placeholder="Describa el servicio requerido..."
                  value={nuevaCita.descripcion}
                  onChange={e => setNuevaCita({ ...nuevaCita, descripcion: e.target.value })}
                  className={errors.descripcion ? 'input-error' : ''}
                  rows={4}
                />
                {errors.descripcion && <span className="error-message">{errors.descripcion}</span>}
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="boton boton-guardar" onClick={agregarCita}>
                Agendar Cita
              </button>
              <button className="boton boton-cancelar" onClick={() => setShowModalAgregar(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR CITA */}
      {showModalEditar && citaEditada && (
        <div className="modal-overlay" onClick={() => {
          setShowModalEditar(false);
          limpiarErrores();
        }}>
          <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Cita #{citaEditada.id}</h3>
              <button 
                className="btn-close" 
                onClick={() => setShowModalEditar(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Cliente</label>
                <input
                  value={citaEditada.cliente_nombre || ''}
                  disabled
                  className="input-disabled"
                />
              </div>
              
              <div className="form-group">
                <label>Vehículo</label>
                <input
                  value={`${citaEditada.vehiculo_placa} - ${citaEditada.vehiculo_marca} ${citaEditada.vehiculo_modelo}`}
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
                  disabled={citaEditada.estado === 'Aceptada'}
                />
                {errors.fecha && <span className="error-message">{errors.fecha}</span>}
              </div>
              
              <div className="form-group">
                <label>Hora *</label>
                <input
                  type="time"
                  value={citaEditada.hora.substring(0, 5)}
                  onChange={e => {
                    const nuevaHora = e.target.value ? e.target.value + ':00' : '';
                    setCitaEditada({ ...citaEditada, hora: nuevaHora });
                  }}
                  className={errors.hora ? 'input-error' : ''}
                  min="08:00"
                  max="18:00"
                  disabled={citaEditada.estado === 'Aceptada'}
                />
                {errors.hora && <span className="error-message">{errors.hora}</span>}
              </div>
              
              <div className="form-group">
                <label>Estado</label>
                <select
                  value={citaEditada.estado}
                  onChange={e => setCitaEditada({ ...citaEditada, estado: e.target.value as Cita['estado'] })}
                  disabled={citaEditada.estado === 'Aceptada'}
                >
                  {opcionesEstado.map(opcion => (
                    <option key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </option>
                  ))}
                </select>
                {citaEditada.estado === 'Aceptada' && (
                  <small className="field-info">No se puede cambiar el estado de una cita aceptada</small>
                )}
              </div>
              
              <div className="form-group">
                <label>Descripción *</label>
                <textarea
                  value={citaEditada.descripcion}
                  onChange={e => setCitaEditada({ ...citaEditada, descripcion: e.target.value })}
                  className={errors.descripcion ? 'input-error' : ''}
                  rows={4}
                />
                {errors.descripcion && <span className="error-message">{errors.descripcion}</span>}
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

      {/* MODAL ASIGNAR MECÁNICO */}
      {showModalAsignar && selected && (
        <div className="modal-overlay" onClick={() => {
          setShowModalAsignar(false);
          setMecanicoSeleccionado('');
        }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Asignar Mecánico - Cita #{selected.id}</h3>
              <button 
                className="btn-close" 
                onClick={() => setShowModalAsignar(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Seleccionar Mecánico *</label>
                <select
                  value={mecanicoSeleccionado}
                  onChange={e => setMecanicoSeleccionado(e.target.value)}
                >
                  <option value="">Seleccione un mecánico</option>
                  {mecanicos.map(mecanico => (
                    <option key={mecanico.id} value={mecanico.id}>
                      {mecanico.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="info-cita">
                <p><strong>Detalles de la cita:</strong></p>
                <p>Cliente: {selected.cliente_nombre}</p>
                <p>Vehículo: {selected.vehiculo_placa}</p>
                <p>Fecha: {new Date(selected.fecha).toLocaleDateString('es-ES')}</p>
                <p>Hora: {selected.hora.substring(0, 5)}</p>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="boton boton-guardar" onClick={asignarMecanico}>
                Asignar Mecánico
              </button>
              <button className="boton boton-cancelar" onClick={() => setShowModalAsignar(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN REEMPLAZO DE CITA */}
      {showModalConfirmacion && vehiculoConCita && (
        <div className="modal-overlay" onClick={() => {
          setShowModalConfirmacion(false);
          setVehiculoConCita(null);
        }}>
          <div className="modal modal-alerta" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ Vehículo con Cita Programada</h3>
              <button 
                className="btn-close" 
                onClick={() => {
                  setShowModalConfirmacion(false);
                  setVehiculoConCita(null);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="warning-message">
                <p><strong>El vehículo seleccionado ya tiene una cita activa:</strong></p>
                <div className="cita-existente">
                  <p><b>Vehículo:</b> {vehiculoConCita.vehiculo.placa} - {vehiculoConCita.vehiculo.marca} {vehiculoConCita.vehiculo.modelo}</p>
                  <p><b>Cliente:</b> {vehiculoConCita.cita.cliente_nombre}</p>
                  <p><b>Cita existente:</b> {new Date(vehiculoConCita.cita.fecha).toLocaleDateString('es-ES')} {vehiculoConCita.cita.hora.substring(0, 5)}</p>
                  <p><b>Estado:</b> {vehiculoConCita.cita.estado}</p>
                  <p><b>Mecánico:</b> {vehiculoConCita.cita.mecanico_nombre || 'Sin Asignar'}</p>
                </div>
                
                <p className="warning-text">
                  ¿Desea cancelar la cita existente y crear una nueva?
                </p>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="boton boton-eliminar" onClick={confirmarReemplazo}>
                Sí, cancelar cita existente
              </button>
              <button 
                className="boton boton-cancelar" 
                onClick={() => {
                  setShowModalConfirmacion(false);
                  setVehiculoConCita(null);
                }}
              >
                No, mantener cita existente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Citas;