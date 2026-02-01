// src/pages/Citas.tsx - VERSIÓN SIMPLIFICADA
import React, { useState, useEffect, useCallback } from 'react';
import { citasService, type Cita as CitaServicio } from '../services/citas.service';
import '../styles/pages/Citas.css';

// Interfaces adaptadas a lo que REALMENTE devuelve el backend
interface CitaBackend {
  id: number;
  vehiculo_cliente_id: number;  // Solo ID
  fecha: string;
  hora: string;
  descripcion: string;
  usuario_id: number | null;    // Solo ID
  estado: string;               // String simple
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

  // Nueva cita (solo campos básicos)
  const [nuevaCita, setNuevaCita] = useState({
    vehiculo_cliente_id: '',
    fecha: '',
    hora: '',
    descripcion: '',
    estado: 'En Espera'
  });

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
    // Datos generados para mostrar (simulados)
    display_cliente: `Cliente ${cita.vehiculo_cliente_id}`,
    display_vehiculo: `Vehículo ${cita.vehiculo_cliente_id}`,
    display_mecanico: cita.usuario_id ? `Mecánico ${cita.usuario_id}` : 'Sin Asignar'
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
    cargarEstadisticas();
  }, []);

  // Búsqueda con debounce
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
      newErrors.vehiculo_cliente_id = 'ID de vehículo-cliente es obligatorio';
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

      // Crear la cita
      const response = await citasService.createCita({
      vehiculo_cliente_id: parseInt(nuevaCita.vehiculo_cliente_id),
      fecha: nuevaCita.fecha,
      hora: nuevaCita.hora,
      descripcion: nuevaCita.descripcion,
      estado: nuevaCita.estado,
      usuario_id: null // O un valor por defecto si es requerido
    });
      
      if (response?.success) {
        await cargarCitas();
        await cargarEstadisticas();
        
        setNuevaCita({
          vehiculo_cliente_id: '',
          fecha: '',
          hora: '',
          descripcion: '',
          estado: 'En Espera'
        });
        
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
      estado: citaEditada.estado
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

      // Actualizar la cita
      const response = await citasService.updateCita(citaEditada.id, {
        fecha: citaEditada.fecha,
        hora: citaEditada.hora,
        descripcion: citaEditada.descripcion,
        estado: citaEditada.estado
      });
      
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
              onClick={() => setShowModalAgregar(true)}
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

      {/* MODAL AGREGAR CITA */}
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
              <div className="form-group">
                <label>Vehículo-Cliente ID *</label>
                <input
                  type="number"
                  placeholder="Ej: 101, 102, 103..."
                  value={nuevaCita.vehiculo_cliente_id}
                  onChange={e => setNuevaCita({ ...nuevaCita, vehiculo_cliente_id: e.target.value })}
                  className={errors.vehiculo_cliente_id ? 'input-error' : ''}
                  disabled={loading}
                />
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
                  disabled={loading}
                />
                {errors.fecha && <span className="error-message">{errors.fecha}</span>}
              </div>
              
              <div className="form-group">
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
              
              <div className="form-group">
                <label>Descripción *</label>
                <textarea
                  placeholder="Describa el servicio requerido..."
                  value={nuevaCita.descripcion}
                  onChange={e => setNuevaCita({ ...nuevaCita, descripcion: e.target.value })}
                  className={errors.descripcion ? 'input-error' : ''}
                  rows={4}
                  disabled={loading}
                />
                {errors.descripcion && <span className="error-message">{errors.descripcion}</span>}
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="boton boton-guardar" onClick={agregarCita} disabled={loading}>
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