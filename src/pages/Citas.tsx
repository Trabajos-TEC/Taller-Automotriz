// src/pages/Citas.tsx
import React, { useState, useEffect } from 'react';
import '../styles/pages/Citas.css';

interface Cita {
  id: string;
  clienteCedula: string;
  clienteNombre: string;
  vehiculoPlaca: string;
  fecha: string;
  hora: string;
  descripcion: string;
  mecanico: string;
  estado: 'En Espera' | 'Aceptada' | 'Cancelada' | 'Completada';
  createdAt?: string;
}

interface Vehiculo {
  placa: string;
  marca: string;
  modelo: string;
  clienteCedula: string;
  clienteNombre: string;
}

interface Usuario {
  id: string;
  nombre: string;
  rol: string;
  email: string;
}

const Citas: React.FC = () => {
  // Estado para la lista de citas
  const [citas, setCitas] = useState<Cita[]>([
    { id: '1', clienteCedula: '123456789', clienteNombre: 'Juan Pérez', vehiculoPlaca: 'ABC123', fecha: '2024-01-15', hora: '09:00', descripcion: 'Cambio de aceite y filtro', mecanico: 'Carlos López', estado: 'Aceptada' },
    { id: '2', clienteCedula: '987654321', clienteNombre: 'María García', vehiculoPlaca: 'XYZ789', fecha: '2024-01-16', hora: '10:30', descripcion: 'Revisión general', mecanico: 'Sin Asignar', estado: 'En Espera' },
    { id: '3', clienteCedula: '456789123', clienteNombre: 'Pedro Martínez', vehiculoPlaca: 'DEF456', fecha: '2024-01-17', hora: '14:00', descripcion: 'Reparación de frenos', mecanico: 'Ana Rodríguez', estado: 'Completada' },
    { id: '4', clienteCedula: '321654987', clienteNombre: 'Laura Fernández', vehiculoPlaca: 'GHI789', fecha: '2024-01-18', hora: '11:00', descripcion: 'Alineación y balanceo', mecanico: 'Sin Asignar', estado: 'En Espera' },
    { id: '5', clienteCedula: '789123456', clienteNombre: 'Carlos Ruiz', vehiculoPlaca: 'JKL012', fecha: '2024-01-19', hora: '15:30', descripcion: 'Cambio de batería', mecanico: 'Miguel Sánchez', estado: 'Cancelada' },
  ]);

  // Estados para datos adicionales
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([
    { placa: 'ABC123', marca: 'Toyota', modelo: 'Corolla', clienteCedula: '123456789', clienteNombre: 'Juan Pérez' },
    { placa: 'XYZ789', marca: 'Honda', modelo: 'Civic', clienteCedula: '987654321', clienteNombre: 'María García' },
    { placa: 'DEF456', marca: 'Ford', modelo: 'Ranger', clienteCedula: '456789123', clienteNombre: 'Pedro Martínez' },
  ]);

  const [mecanicos, setMecanicos] = useState<Usuario[]>([
    { id: '1', nombre: 'Carlos López', rol: 'mecanico', email: 'carlos@taller.com' },
    { id: '2', nombre: 'Ana Rodríguez', rol: 'mecanico', email: 'ana@taller.com' },
    { id: '3', nombre: 'Miguel Sánchez', rol: 'mecanico', email: 'miguel@taller.com' },
  ]);

  // Estados para búsqueda y selección
  const [search, setSearch] = useState('');
  const [searchVehiculo, setSearchVehiculo] = useState('');
  const [selected, setSelected] = useState<Cita | null>(null);
  const [showModalAgregar, setShowModalAgregar] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showModalAsignar, setShowModalAsignar] = useState(false);
  const [showModalConfirmacion, setShowModalConfirmacion] = useState(false);

  // Estados para formularios
  const [nuevaCita, setNuevaCita] = useState<Omit<Cita, 'id'>>({
    clienteCedula: '',
    clienteNombre: '',
    vehiculoPlaca: '',
    fecha: '',
    hora: '',
    descripcion: '',
    mecanico: 'Sin Asignar',
    estado: 'En Espera'
  });

  const [citaEditada, setCitaEditada] = useState<Cita | null>(null);
  const [mecanicoSeleccionado, setMecanicoSeleccionado] = useState('');
  
  // Estados para validación
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [vehiculoConCita, setVehiculoConCita] = useState<{vehiculo: Vehiculo, cita: Cita} | null>(null);

  // Cargar datos (simulando API)
  useEffect(() => {
    // En una implementación real, aquí harías fetch a tus APIs
    console.log('Datos cargados');
  }, []);

  // Filtrar citas
  const citasFiltradas = citas.filter(c =>
    c.clienteNombre.toLowerCase().includes(search.toLowerCase()) ||
    c.vehiculoPlaca.toLowerCase().includes(search.toLowerCase()) ||
    c.mecanico.toLowerCase().includes(search.toLowerCase()) ||
    c.estado.toLowerCase().includes(search.toLowerCase())
  );

  // Filtrar vehículos para búsqueda
  const vehiculosFiltrados = vehiculos.filter(v =>
    v.placa.toLowerCase().includes(searchVehiculo.toLowerCase()) ||
    v.marca.toLowerCase().includes(searchVehiculo.toLowerCase()) ||
    v.clienteNombre.toLowerCase().includes(searchVehiculo.toLowerCase())
  );

  // Verificar si un vehículo ya tiene cita
  const verificarCitaExistente = (placa: string): Cita | null => {
    return citas.find(c => 
      c.vehiculoPlaca === placa && 
      c.estado !== 'Cancelada' && 
      c.estado !== 'Completada'
    ) || null;
  };

  /* === VALIDAR FORMULARIO === */
  const validarCita = (cita: Omit<Cita, 'id'> | Cita): {[key: string]: string} => {
    const newErrors: {[key: string]: string} = {};

    if (!cita.vehiculoPlaca.trim()) {
      newErrors.vehiculoPlaca = 'El vehículo es obligatorio';
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
      const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
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
  const manejarSeleccionVehiculo = (placa: string) => {
    const vehiculo = vehiculos.find(v => v.placa === placa);
    if (!vehiculo) return;

    // Verificar si ya tiene cita activa
    const citaExistente = verificarCitaExistente(placa);
    
    if (citaExistente) {
      setVehiculoConCita({ vehiculo, cita: citaExistente });
      setShowModalConfirmacion(true);
    } else {
      // Actualizar datos del cliente en el formulario
      setNuevaCita({
        ...nuevaCita,
        vehiculoPlaca: vehiculo.placa,
        clienteCedula: vehiculo.clienteCedula,
        clienteNombre: vehiculo.clienteNombre
      });
    }
  };

  /* === CONFIRMAR REEMPLAZO DE CITA === */
  const confirmarReemplazo = () => {
    if (!vehiculoConCita) return;

    // Cancelar cita existente
    setCitas(citas.map(c => 
      c.id === vehiculoConCita.cita.id 
        ? { ...c, estado: 'Cancelada' }
        : c
    ));

    // Proceder con la nueva cita
    setNuevaCita({
      ...nuevaCita,
      vehiculoPlaca: vehiculoConCita.vehiculo.placa,
      clienteCedula: vehiculoConCita.vehiculo.clienteCedula,
      clienteNombre: vehiculoConCita.vehiculo.clienteNombre
    });

    setShowModalConfirmacion(false);
    setVehiculoConCita(null);
  };

  /* === AGREGAR CITA === */
  const agregarCita = () => {
    const validationErrors = validarCita(nuevaCita);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Crear nueva cita con ID único
    const nuevaCitaConId: Cita = {
      ...nuevaCita,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    setCitas([...citas, nuevaCitaConId]);
    
    // Limpiar formulario
    setNuevaCita({
      clienteCedula: '',
      clienteNombre: '',
      vehiculoPlaca: '',
      fecha: '',
      hora: '',
      descripcion: '',
      mecanico: 'Sin Asignar',
      estado: 'En Espera'
    });
    
    setErrors({});
    setShowModalAgregar(false);
    
    alert('Cita agendada exitosamente');
  };

  /* === EDITAR CITA === */
  const guardarEdicion = () => {
    if (!citaEditada) return;

    const validationErrors = validarCita(citaEditada);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setCitas(citas.map(c => 
      c.id === citaEditada.id ? citaEditada : c
    ));
    
    setErrors({});
    setShowModalEditar(false);
    setCitaEditada(null);
    
    alert('Cita actualizada exitosamente');
  };

  /* === ASIGNAR MECÁNICO === */
  const asignarMecanico = () => {
    if (!selected || !mecanicoSeleccionado) {
      alert('Seleccione un mecánico');
      return;
    }

    // Verificar disponibilidad del mecánico
    const mecanicoOcupado = citas.some(c => 
      c.id !== selected.id &&
      c.mecanico === mecanicoSeleccionado &&
      c.fecha === selected.fecha &&
      c.hora === selected.hora &&
      c.estado !== 'Cancelada'
    );

    if (mecanicoOcupado) {
      alert('El mecánico ya tiene una cita asignada en ese horario');
      return;
    }

    const citaActualizada: Cita = {
      ...selected,
      mecanico: mecanicoSeleccionado,
      estado: 'Aceptada'
    };

    setCitas(citas.map(c => 
      c.id === selected.id ? citaActualizada : c
    ));
    
    setSelected(citaActualizada);
    setShowModalAsignar(false);
    setMecanicoSeleccionado('');
    
    alert('Mecánico asignado exitosamente');
  };

  /* === CAMBIAR ESTADO === */
  const cambiarEstado = (id: string, nuevoEstado: Cita['estado']) => {
    if (nuevoEstado === 'Cancelada') {
      if (!confirm('¿Está seguro de cancelar esta cita?')) return;
    }

    setCitas(citas.map(c => 
      c.id === id ? { ...c, estado: nuevoEstado } : c
    ));
  };

  /* === ELIMINAR CITA === */
  const eliminarCita = (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta cita permanentemente?')) return;

    setCitas(citas.filter(c => c.id !== id));
    setSelected(null);
    alert('Cita eliminada');
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
                {citasFiltradas.map((cita) => (
                  <tr 
                    key={cita.id}
                    className={selected?.id === cita.id ? 'selected-row' : ''}
                    onClick={() => setSelected(cita)}
                  >
                    <td>{cita.clienteNombre}</td>
                    <td className="placa-column">{cita.vehiculoPlaca}</td>
                    <td>{new Date(cita.fecha).toLocaleDateString('es-ES')}</td>
                    <td>{cita.hora}</td>
                    <td>{cita.mecanico}</td>
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
                ))}
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
                  <span className="detail-value">{selected.clienteNombre}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Cédula:</span>
                  <span className="detail-value">{selected.clienteCedula}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Vehículo:</span>
                  <span className="detail-value placa-value">{selected.vehiculoPlaca}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Fecha:</span>
                  <span className="detail-value">{new Date(selected.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Hora:</span>
                  <span className="detail-value">{selected.hora}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Mecánico:</span>
                  <span className="detail-value">{selected.mecanico}</span>
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
                      setCitaEditada(selected);
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
                  value={nuevaCita.vehiculoPlaca}
                  onChange={e => manejarSeleccionVehiculo(e.target.value)}
                  className={errors.vehiculoPlaca ? 'input-error' : ''}
                >
                  <option value="">Seleccione un vehículo</option>
                  {vehiculosFiltrados.map(vehiculo => (
                    <option key={vehiculo.placa} value={vehiculo.placa}>
                      {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo} ({vehiculo.clienteNombre})
                    </option>
                  ))}
                </select>
                {errors.vehiculoPlaca && <span className="error-message">{errors.vehiculoPlaca}</span>}
              </div>
              
              {nuevaCita.clienteNombre && (
                <div className="info-cliente">
                  <p><strong>Cliente seleccionado:</strong> {nuevaCita.clienteNombre} ({nuevaCita.clienteCedula})</p>
                </div>
              )}
              
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
                  value={nuevaCita.hora}
                  onChange={e => setNuevaCita({ ...nuevaCita, hora: e.target.value })}
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
                  value={citaEditada.clienteNombre}
                  disabled
                  className="input-disabled"
                />
              </div>
              
              <div className="form-group">
                <label>Vehículo</label>
                <input
                  value={citaEditada.vehiculoPlaca}
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
                  value={citaEditada.hora}
                  onChange={e => setCitaEditada({ ...citaEditada, hora: e.target.value })}
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
                    <option key={mecanico.id} value={mecanico.nombre}>
                      {mecanico.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="info-cita">
                <p><strong>Detalles de la cita:</strong></p>
                <p>Cliente: {selected.clienteNombre}</p>
                <p>Vehículo: {selected.vehiculoPlaca}</p>
                <p>Fecha: {new Date(selected.fecha).toLocaleDateString('es-ES')}</p>
                <p>Hora: {selected.hora}</p>
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
                  <p><b>Cliente:</b> {vehiculoConCita.cita.clienteNombre}</p>
                  <p><b>Cita existente:</b> {new Date(vehiculoConCita.cita.fecha).toLocaleDateString('es-ES')} {vehiculoConCita.cita.hora}</p>
                  <p><b>Estado:</b> {vehiculoConCita.cita.estado}</p>
                  <p><b>Mecánico:</b> {vehiculoConCita.cita.mecanico}</p>
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