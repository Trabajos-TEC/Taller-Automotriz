import React, { useState, useMemo } from 'react';
import '../styles/pages/GestionTrabajos.css';
import '../styles/Botones.css';

// Interfaces
interface Trabajo {
  codigoOrden: string;
  clienteNombre: string;
  clienteCedula: string;
  placa: string;
  fechaCreacion: string;
  estado: 'Pendiente' | 'En proceso' | 'Finalizada' | 'Cancelada';
  observacionesIniciales: string;
  repuestosUtilizados?: {
    codigo: string;
    nombre: string;
    cantidad: number;
    precio: number;
    subtotal: number;
  }[];
  serviciosRealizados?: {
    codigo: string;
    nombre: string;
    precio: number;
    descripcion: string;
  }[];
  notasDiagnostico?: {
    id: number;
    texto: string;
    fecha: string;
  }[];
  idCita?: string;
}

// Interface Vehiculo definida pero no usada actualmente
// interface Vehiculo {
//   placa: string;
//   marca: string;
//   modelo: string;
//   tipo: string;
//   vehiculoBaseId?: number;
}

interface Cita {
  id: string;
  clienteNombre: string;
  clienteCedula: string;
  vehiculoPlaca: string;
  estado: string;
  mecanico: string;
}

const GestionTrabajos: React.FC<{ session: any }> = ({ session }) => {
  // Datos mockeados de trabajos
  const [trabajos, setTrabajos] = useState<Trabajo[]>([
    {
      codigoOrden: 'OT-001',
      clienteNombre: 'Juan Pérez',
      clienteCedula: '123456789',
      placa: 'ABC-123',
      fechaCreacion: '2024-03-15',
      estado: 'Pendiente',
      observacionesIniciales: 'Cambio de aceite y filtro',
      repuestosUtilizados: [
        { codigo: 'R001', nombre: 'Aceite Motor 5W-30', cantidad: 1, precio: 25000, subtotal: 25000 },
        { codigo: 'R002', nombre: 'Filtro de Aceite', cantidad: 1, precio: 12000, subtotal: 12000 }
      ],
      serviciosRealizados: [
        { codigo: 'S001', nombre: 'Cambio de Aceite', precio: 15000, descripcion: 'Cambio completo de aceite' }
      ],
      notasDiagnostico: [
        { id: 1, texto: 'El vehículo presenta fuga mínima de aceite en el cárter', fecha: '2024-03-15 09:30' }
      ],
      idCita: 'CITA-001'
    },
    {
      codigoOrden: 'OT-002',
      clienteNombre: 'María García',
      clienteCedula: '987654321',
      placa: 'XYZ-789',
      fechaCreacion: '2024-03-16',
      estado: 'En proceso',
      observacionesIniciales: 'Revisión de frenos',
      repuestosUtilizados: [
        { codigo: 'R003', nombre: 'Pastillas de Freno Delanteras', cantidad: 2, precio: 18000, subtotal: 36000 }
      ],
      serviciosRealizados: [
        { codigo: 'S002', nombre: 'Revisión de Frenos', precio: 20000, descripcion: 'Revisión completa del sistema de frenos' },
        { codigo: 'S003', nombre: 'Cambio de Pastillas', precio: 15000, descripcion: 'Cambio de pastillas delanteras' }
      ],
      idCita: 'CITA-002'
    },
    {
      codigoOrden: 'OT-003',
      clienteNombre: 'Carlos López',
      clienteCedula: '456789123',
      placa: 'DEF-456',
      fechaCreacion: '2024-03-17',
      estado: 'Finalizada',
      observacionesIniciales: 'Alineación y balanceo',
      serviciosRealizados: [
        { codigo: 'S004', nombre: 'Alineación', precio: 12000, descripcion: 'Alineación de las 4 ruedas' },
        { codigo: 'S005', nombre: 'Balanceo', precio: 10000, descripcion: 'Balanceo de ruedas' }
      ],
      idCita: 'CITA-003'
    },
    {
      codigoOrden: 'OT-004',
      clienteNombre: 'Ana Rodríguez',
      clienteCedula: '321654987',
      placa: 'GHI-789',
      fechaCreacion: '2024-03-18',
      estado: 'Pendiente',
      observacionesIniciales: 'Cambio de batería',
      repuestosUtilizados: [
        { codigo: 'R004', nombre: 'Batería 12V 60Ah', cantidad: 1, precio: 65000, subtotal: 65000 }
      ],
      idCita: 'CITA-004'
    },
    {
      codigoOrden: 'OT-005',
      clienteNombre: 'Pedro Martínez',
      clienteCedula: '789123456',
      placa: 'JKL-012',
      fechaCreacion: '2024-03-19',
      estado: 'Cancelada',
      observacionesIniciales: 'Cambio de amortiguadores',
      idCita: 'CITA-005'
    }
  ]);

  // Datos mockeados de inventario
  const [inventario] = useState([
    { codigo: 'R001', nombre: 'Aceite Motor 5W-30', precio: 25000, cantidad: 25, vehiculoId: null },
    { codigo: 'R002', nombre: 'Filtro de Aceite', precio: 12000, cantidad: 40, vehiculoId: null },
    { codigo: 'R003', nombre: 'Pastillas de Freno Delanteras', precio: 18000, cantidad: 15, vehiculoId: 1 },
    { codigo: 'R004', nombre: 'Batería 12V 60Ah', precio: 65000, cantidad: 8, vehiculoId: null },
    { codigo: 'R005', nombre: 'Filtro de Aire', precio: 15000, cantidad: 30, vehiculoId: null },
    { codigo: 'R006', nombre: 'Bujías', precio: 8000, cantidad: 50, vehiculoId: 2 }
  ]);

  // Datos mockeados de servicios
  const [manoDeObra] = useState([
    { codigo: 'S001', nombre: 'Cambio de Aceite', precio: 15000, descripcion: 'Cambio completo de aceite' },
    { codigo: 'S002', nombre: 'Revisión de Frenos', precio: 20000, descripcion: 'Revisión completa del sistema de frenos' },
    { codigo: 'S003', nombre: 'Cambio de Pastillas', precio: 15000, descripcion: 'Cambio de pastillas delanteras' },
    { codigo: 'S004', nombre: 'Alineación', precio: 12000, descripcion: 'Alineación de las 4 ruedas' },
    { codigo: 'S005', nombre: 'Balanceo', precio: 10000, descripcion: 'Balanceo de ruedas' },
    { codigo: 'S006', nombre: 'Cambio de Batería', precio: 10000, descripcion: 'Cambio e instalación de batería' }
  ]);

  // Datos mockeados de citas
  const [citas] = useState<Cita[]>([
    { id: 'CITA-006', clienteNombre: 'Luis Fernández', clienteCedula: '654987321', vehiculoPlaca: 'MNO-345', estado: 'Aceptada', mecanico: 'Mecánico 1' },
    { id: 'CITA-007', clienteNombre: 'Sofía Castro', clienteCedula: '987321654', vehiculoPlaca: 'PQR-678', estado: 'Aceptada', mecanico: 'Mecánico 2' },
    { id: 'CITA-008', clienteNombre: 'Roberto Díaz', clienteCedula: '123987456', vehiculoPlaca: 'STU-901', estado: 'Pendiente', mecanico: 'Mecánico 1' }
  ]);

  // Estados para búsqueda y selección
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Trabajo | null>(null);
  const [showModalNuevaOT, setShowModalNuevaOT] = useState(false);
  const [showModalDetalle, setShowModalDetalle] = useState(false);
  const [showModalEstado, setShowModalEstado] = useState(false);
  const [showModalNota, setShowModalNota] = useState(false);
  const [notaSeleccionada, setNotaSeleccionada] = useState<any>(null);

  // Estados para nueva orden
  const [newOT, setNewOT] = useState({
    codigoCita: '',
    observacionesIniciales: '',
  });

  // Estados para detalles
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('Pendiente');
  const [repSeleccionado, setRepSeleccionado] = useState('');
  const [cantidadRep, setCantidadRep] = useState(1);
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [nuevaNotaDiagnostico, setNuevaNotaDiagnostico] = useState('');

  // Constantes
  const ESTADOS = ['Pendiente', 'En proceso', 'Finalizada', 'Cancelada'];

  /* === FILTRAR TRABAJOS === */
  const trabajosFiltrados = useMemo(() => {
    if (!search.trim()) return trabajos;
    
    const s = search.toLowerCase();
    return trabajos.filter(t =>
      t.codigoOrden.toLowerCase().includes(s) ||
      t.clienteNombre.toLowerCase().includes(s) ||
      t.placa.toLowerCase().includes(s) ||
      t.clienteCedula.includes(search)
    );
  }, [trabajos, search]);

  /* === OBTENER CITAS DISPONIBLES === */
  const citasDisponibles = useMemo(() => {
    // Filtrar citas aceptadas que no tienen orden de trabajo
    const citasAceptadas = citas.filter(c => c.estado === 'Aceptada');
    
    if (session.rol !== 'admin') {
      // Filtrar por mecánico asignado
      return citasAceptadas.filter(cita => 
        cita.mecanico === session.nombre &&
        !trabajos.find(t => t.idCita === cita.id)
      );
    }
    
    // Admin ve todas las citas sin orden
    return citasAceptadas.filter(cita => 
      !trabajos.find(t => t.idCita === cita.id)
    );
  }, [citas, trabajos, session]);

  /* === CREAR ORDEN DESDE CITA === */
  const crearOrdenDesdeCita = () => {
    const { codigoCita, observacionesIniciales } = newOT;
    
    if (!codigoCita) {
      alert('Debe seleccionar una cita');
      return;
    }

    const citaSeleccionada = citas.find(c => c.id === codigoCita);
    if (!citaSeleccionada) {
      alert('Cita no encontrada');
      return;
    }

    // Verificar permisos
    if (session.rol !== 'admin' && citaSeleccionada.mecanico !== session.nombre) {
      alert('No tienes permisos para crear una orden para esta cita');
      return;
    }

    // Generar nuevo código de orden
    const nuevoCodigo = `OT-${String(trabajos.length + 1).padStart(3, '0')}`;

    // Crear nueva orden
    const nuevaOrden: Trabajo = {
      codigoOrden: nuevoCodigo,
      clienteNombre: citaSeleccionada.clienteNombre,
      clienteCedula: citaSeleccionada.clienteCedula,
      placa: citaSeleccionada.vehiculoPlaca,
      fechaCreacion: new Date().toISOString().split('T')[0],
      estado: 'Pendiente',
      observacionesIniciales: observacionesIniciales.trim() || 'Sin observaciones iniciales',
      repuestosUtilizados: [],
      serviciosRealizados: [],
      notasDiagnostico: [],
      idCita: codigoCita
    };

    // Agregar a la lista
    setTrabajos([...trabajos, nuevaOrden]);
    setNewOT({ codigoCita: '', observacionesIniciales: '' });
    setShowModalNuevaOT(false);
    
    alert(`Orden ${nuevoCodigo} creada exitosamente`);
  };

  /* === AGREGAR REPUESTO A ORDEN === */
  const agregarRepuestoTrabajo = () => {
    if (!selected || !repSeleccionado) return;

    const repuesto = inventario.find(r => r.codigo === repSeleccionado);
    if (!repuesto) {
      alert('Repuesto no encontrado');
      return;
    }

    if (cantidadRep > repuesto.cantidad) {
      alert('No hay suficiente stock');
      return;
    }

    // Crear copia del trabajo seleccionado
    const trabajoActualizado = { ...selected };
    
    // Inicializar array si no existe
    if (!trabajoActualizado.repuestosUtilizados) {
      trabajoActualizado.repuestosUtilizados = [];
    }

    // Verificar si ya existe
    const repuestoExistente = trabajoActualizado.repuestosUtilizados.find(r => r.codigo === repSeleccionado);
    
    if (repuestoExistente) {
      // Actualizar cantidad existente
      repuestoExistente.cantidad += cantidadRep;
      repuestoExistente.subtotal = repuestoExistente.cantidad * repuesto.precio;
    } else {
      // Agregar nuevo
      trabajoActualizado.repuestosUtilizados.push({
        codigo: repuesto.codigo,
        nombre: repuesto.nombre,
        cantidad: cantidadRep,
        precio: repuesto.precio,
        subtotal: repuesto.precio * cantidadRep
      });
    }

    // Actualizar estados
    setSelected(trabajoActualizado);
    setTrabajos(trabajos.map(t => 
      t.codigoOrden === trabajoActualizado.codigoOrden ? trabajoActualizado : t
    ));

    // Limpiar formulario
    setRepSeleccionado('');
    setCantidadRep(1);
    
    alert('Repuesto agregado exitosamente');
  };

  /* === ELIMINAR REPUESTO === */
  const eliminarRepuesto = (index: number) => {
    if (!selected || !selected.repuestosUtilizados) return;

    const trabajoActualizado = { ...selected };
    trabajoActualizado.repuestosUtilizados = trabajoActualizado.repuestosUtilizados?.filter((_, i) => i !== index);
    
    setSelected(trabajoActualizado);
    setTrabajos(trabajos.map(t => 
      t.codigoOrden === trabajoActualizado.codigoOrden ? trabajoActualizado : t
    ));
  };

  /* === AGREGAR SERVICIO A ORDEN === */
  const agregarServicioTrabajo = () => {
    if (!selected || !servicioSeleccionado) return;

    const servicio = manoDeObra.find(s => s.codigo === servicioSeleccionado);
    if (!servicio) {
      alert('Servicio no encontrado');
      return;
    }

    const trabajoActualizado = { ...selected };
    
    if (!trabajoActualizado.serviciosRealizados) {
      trabajoActualizado.serviciosRealizados = [];
    }

    // Verificar si ya existe
    const servicioExistente = trabajoActualizado.serviciosRealizados.find(s => s.codigo === servicioSeleccionado);
    
    if (!servicioExistente) {
      trabajoActualizado.serviciosRealizados.push({
        codigo: servicio.codigo,
        nombre: servicio.nombre,
        precio: servicio.precio,
        descripcion: servicio.descripcion
      });
    }

    setSelected(trabajoActualizado);
    setTrabajos(trabajos.map(t => 
      t.codigoOrden === trabajoActualizado.codigoOrden ? trabajoActualizado : t
    ));

    setServicioSeleccionado('');
    alert('Servicio agregado exitosamente');
  };

  /* === ELIMINAR SERVICIO === */
  const eliminarServicio = (index: number) => {
    if (!selected || !selected.serviciosRealizados) return;

    const trabajoActualizado = { ...selected };
    trabajoActualizado.serviciosRealizados = trabajoActualizado.serviciosRealizados?.filter((_, i) => i !== index);
    
    setSelected(trabajoActualizado);
    setTrabajos(trabajos.map(t => 
      t.codigoOrden === trabajoActualizado.codigoOrden ? trabajoActualizado : t
    ));
  };

  /* === AGREGAR NOTA DE DIAGNÓSTICO === */
  const agregarNotaDiagnostico = () => {
    if (!selected || !nuevaNotaDiagnostico.trim()) return;

    const trabajoActualizado = { ...selected };
    
    if (!trabajoActualizado.notasDiagnostico) {
      trabajoActualizado.notasDiagnostico = [];
    }

    const nuevaNota = {
      id: Date.now(),
      texto: nuevaNotaDiagnostico.trim(),
      fecha: new Date().toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    trabajoActualizado.notasDiagnostico.push(nuevaNota);
    
    setSelected(trabajoActualizado);
    setTrabajos(trabajos.map(t => 
      t.codigoOrden === trabajoActualizado.codigoOrden ? trabajoActualizado : t
    ));

    setNuevaNotaDiagnostico('');
  };

  /* === ELIMINAR NOTA === */
  const eliminarNotaDiagnostico = (idNota: number) => {
    if (!selected || !selected.notasDiagnostico) return;

    const trabajoActualizado = { ...selected };
    trabajoActualizado.notasDiagnostico = trabajoActualizado.notasDiagnostico?.filter(nota => nota.id !== idNota);
    
    setSelected(trabajoActualizado);
    setTrabajos(trabajos.map(t => 
      t.codigoOrden === trabajoActualizado.codigoOrden ? trabajoActualizado : t
    ));
  };

  /* === GUARDAR CAMBIOS === */
  const guardarDetalleTrabajo = () => {
    if (!selected) return;

    setTrabajos(trabajos.map(t => 
      t.codigoOrden === selected.codigoOrden ? selected : t
    ));
    
    setShowModalDetalle(false);
    alert('Orden actualizada correctamente');
  };

  /* === CAMBIAR ESTADO === */
  const guardarNuevoEstado = () => {
    if (!selected) return;

    const trabajoActualizado = { ...selected, estado: estadoSeleccionado as Trabajo['estado'] };
    
    setSelected(trabajoActualizado);
    setTrabajos(trabajos.map(t => 
      t.codigoOrden === trabajoActualizado.codigoOrden ? trabajoActualizado : t
    ));
    
    setShowModalEstado(false);
    alert('Estado actualizado correctamente');
  };

  /* === ABRIR MODAL DE NOTA === */
  // Función actualmente no usada, se mantiene por si se necesita
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const abrirModalNota = (nota: any) => {
    setNotaSeleccionada(nota);
    setShowModalNota(true);
  };

  /* === CERRAR MODALES === */
  const cerrarModales = () => {
    if (showModalDetalle) setShowModalDetalle(false);
    if (showModalNuevaOT) setShowModalNuevaOT(false);
    if (showModalEstado) setShowModalEstado(false);
    if (showModalNota) setShowModalNota(false);
    setNotaSeleccionada(null);
  };

  /* === CALCULAR TOTAL === */
  const calcularTotal = (trabajo: Trabajo) => {
    let total = 0;
    
    if (trabajo.repuestosUtilizados) {
      total += trabajo.repuestosUtilizados.reduce((sum, rep) => sum + rep.subtotal, 0);
    }
    
    if (trabajo.serviciosRealizados) {
      total += trabajo.serviciosRealizados.reduce((sum, serv) => sum + serv.precio, 0);
    }
    
    return total;
  };

  return (
    <div className="gestion-trabajos">
      <div className="header-section">
        <div className="stats">
          <span className="stat-item">Total: {trabajos.length} órdenes</span>
          <span className="stat-item">Mostrando: {trabajosFiltrados.length}</span>
          <span className="stat-item">Pendientes: {trabajos.filter(t => t.estado === 'Pendiente').length}</span>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="contenedor-principal">
        {/* CONTENEDOR IZQUIERDO - LISTA */}
        <div className="contenedor-lista">
          {/* BARRA DE BÚSQUEDA Y BOTÓN */}
          <div className="busqueda-agregar">
            <input
              className="search-bar"
              placeholder="Buscar por código, cliente, placa o cédula..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button
              className="boton boton-agregar boton-grande"
              onClick={() => {
                setShowModalNuevaOT(true);
                setNewOT({ codigoCita: '', observacionesIniciales: '' });
              }}
            >
              <span className="icono">+</span>
              Nueva Orden desde Cita
            </button>
          </div>

          {/* TABLA DE TRABAJOS */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Cliente</th>
                  <th>Placa</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {trabajosFiltrados.map((trabajo) => (
                  <tr 
                    key={trabajo.codigoOrden}
                    className={selected?.codigoOrden === trabajo.codigoOrden ? 'selected-row' : ''}
                    onClick={() => {
                      setSelected(trabajo);
                      setEstadoSeleccionado(trabajo.estado);
                    }}
                  >
                    <td className="codigo-column">{trabajo.codigoOrden}</td>
                    <td className="nombre-column">{trabajo.clienteNombre}</td>
                    <td>{trabajo.placa}</td>
                    <td>
                      <span className={`estado-badge estado-${trabajo.estado.toLowerCase().replace(' ', '-')}`}>
                        {trabajo.estado}
                      </span>
                    </td>
                    <td>{trabajo.fechaCreacion}</td>
                    <td className="total-column">₡{calcularTotal(trabajo).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {trabajosFiltrados.length === 0 && (
              <div className="no-results">
                {search ? 'No se encontraron órdenes' : 'No hay órdenes de trabajo'}
              </div>
            )}
          </div>
        </div>

        {/* CONTENEDOR DERECHO - DETALLES */}
        {selected && !showModalDetalle && (
          <div className="contenedor-detalles">
            <div className="sidebar-details">
              <div className="sidebar-header">
                <h4>Detalles de Orden</h4>
                <button className="btn-close" onClick={() => setSelected(null)}>×</button>
              </div>
              
              <div className="sidebar-body">
                <div className="detail-item">
                  <span className="detail-label">Código:</span>
                  <span className="detail-value">{selected.codigoOrden}</span>
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
                  <span className="detail-label">Placa:</span>
                  <span className="detail-value">{selected.placa}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Estado:</span>
                  <span className="detail-value">
                    <span className={`estado-badge estado-${selected.estado.toLowerCase().replace(' ', '-')}`}>
                      {selected.estado}
                    </span>
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Fecha:</span>
                  <span className="detail-value">{selected.fechaCreacion}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total:</span>
                  <span className="detail-value">₡{calcularTotal(selected).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="sidebar-footer">
                <button 
                  className="boton boton-editar"
                  onClick={() => setShowModalDetalle(true)}
                >
                  Editar Orden
                </button>
                <button 
                  className="boton boton-editar"
                  onClick={() => {
                    setEstadoSeleccionado(selected.estado);
                    setShowModalEstado(true);
                  }}
                >
                  Cambiar Estado
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL NUEVA ORDEN DESDE CITA */}
      {showModalNuevaOT && (
        <div className="modal-overlay" onClick={cerrarModales}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nueva Orden desde Cita</h3>
              <button className="btn-close" onClick={cerrarModales}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="info-usuario">
                <p><strong>Usuario:</strong> {session.nombre} | <strong>Rol:</strong> {session.rol}</p>
                {session.rol !== 'admin' && (
                  <p className="info-text">Solo puedes crear órdenes para citas asignadas a ti.</p>
                )}
              </div>
              
              <div className="form-group">
                <label>Seleccionar Cita *</label>
                <select
                  value={newOT.codigoCita}
                  onChange={e => setNewOT({ ...newOT, codigoCita: e.target.value })}
                  className={!newOT.codigoCita ? 'input-error' : ''}
                >
                  <option value="">Seleccione una cita</option>
                  {citasDisponibles.map((cita) => (
                    <option key={cita.id} value={cita.id}>
                      Cita {cita.id} - {cita.clienteNombre} ({cita.vehiculoPlaca})
                    </option>
                  ))}
                </select>
                {citasDisponibles.length === 0 && (
                  <p className="warning-text">
                    {session.rol === 'admin' 
                      ? 'No hay citas disponibles para generar órdenes.'
                      : 'No tienes citas disponibles para generar órdenes.'
                    }
                  </p>
                )}
              </div>
              
              <div className="form-group">
                <label>Observaciones Iniciales</label>
                <textarea
                  placeholder="Ingrese observaciones iniciales del trabajo..."
                  value={newOT.observacionesIniciales}
                  onChange={e => setNewOT({ ...newOT, observacionesIniciales: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="boton boton-guardar" 
                onClick={crearOrdenDesdeCita}
                disabled={!newOT.codigoCita}
              >
                Crear Orden
              </button>
              <button className="boton boton-cancelar" onClick={cerrarModales}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE ORDEN */}
      {showModalDetalle && selected && (
        <div className="modal-overlay" onClick={cerrarModales}>
          <div className="modal modal-grande" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Orden #{selected.codigoOrden}</h3>
              <button className="btn-close" onClick={cerrarModales}>×</button>
            </div>
            
            <div className="modal-body">
              {/* INFORMACIÓN BÁSICA */}
              <div className="seccion-info">
                <h4>Información del Trabajo</h4>
                <div className="grid-info">
                  <div className="info-item">
                    <label>Cliente:</label>
                    <span>{selected.clienteNombre}</span>
                  </div>
                  <div className="info-item">
                    <label>Cédula:</label>
                    <span>{selected.clienteCedula}</span>
                  </div>
                  <div className="info-item">
                    <label>Placa:</label>
                    <span>{selected.placa}</span>
                  </div>
                  <div className="info-item">
                    <label>Estado:</label>
                    <span className={`estado-badge estado-${selected.estado.toLowerCase().replace(' ', '-')}`}>
                      {selected.estado}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Fecha Creación:</label>
                    <span>{selected.fechaCreacion}</span>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Observaciones Iniciales</label>
                  <textarea
                    value={selected.observacionesIniciales}
                    onChange={e => setSelected({...selected, observacionesIniciales: e.target.value})}
                    rows={2}
                  />
                </div>
              </div>

              {/* REPUESTOS UTILIZADOS */}
              <div className="seccion-items">
                <h4>Repuestos Utilizados</h4>
                <div className="table-scrollable">
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Cantidad</th>
                        <th>Precio Unit.</th>
                        <th>Subtotal</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.repuestosUtilizados?.map((repuesto, index) => (
                        <tr key={index}>
                          <td>{repuesto.codigo}</td>
                          <td>{repuesto.nombre}</td>
                          <td>{repuesto.cantidad}</td>
                          <td>₡{repuesto.precio.toLocaleString()}</td>
                          <td>₡{repuesto.subtotal.toLocaleString()}</td>
                          <td>
                            <button 
                              className="boton boton-eliminar-pequeno"
                              onClick={() => eliminarRepuesto(index)}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                      {(!selected.repuestosUtilizados || selected.repuestosUtilizados.length === 0) && (
                        <tr>
                          <td colSpan={6} className="no-items">No hay repuestos agregados</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div className="agregar-item-form">
                  <div className="form-group-inline">
                    <input
                      type="text"
                      placeholder="Código del repuesto"
                      value={repSeleccionado}
                      onChange={e => setRepSeleccionado(e.target.value)}
                      list="repuestos-lista"
                    />
                    <datalist id="repuestos-lista">
                      {inventario.map(rep => (
                        <option key={rep.codigo} value={rep.codigo}>
                          {rep.nombre} (Stock: {rep.cantidad})
                        </option>
                      ))}
                    </datalist>
                    
                    <input
                      type="number"
                      min="1"
                      placeholder="Cantidad"
                      value={cantidadRep}
                      onChange={e => setCantidadRep(parseInt(e.target.value) || 1)}
                    />
                    
                    <button 
                      className="boton boton-agregar"
                      onClick={agregarRepuestoTrabajo}
                      disabled={!repSeleccionado || cantidadRep < 1}
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </div>

              {/* SERVICIOS REALIZADOS */}
              <div className="seccion-items">
                <h4>Servicios Realizados</h4>
                <div className="table-scrollable">
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Precio</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.serviciosRealizados?.map((servicio, index) => (
                        <tr key={index}>
                          <td>{servicio.codigo}</td>
                          <td>{servicio.nombre}</td>
                          <td>{servicio.descripcion}</td>
                          <td>₡{servicio.precio.toLocaleString()}</td>
                          <td>
                            <button 
                              className="boton boton-eliminar-pequeno"
                              onClick={() => eliminarServicio(index)}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                      {(!selected.serviciosRealizados || selected.serviciosRealizados.length === 0) && (
                        <tr>
                          <td colSpan={5} className="no-items">No hay servicios agregados</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div className="agregar-item-form">
                  <div className="form-group-inline">
                    <input
                      type="text"
                      placeholder="Código del servicio"
                      value={servicioSeleccionado}
                      onChange={e => setServicioSeleccionado(e.target.value)}
                      list="servicios-lista"
                    />
                    <datalist id="servicios-lista">
                      {manoDeObra.map(serv => (
                        <option key={serv.codigo} value={serv.codigo}>
                          {serv.nombre} - ₡{serv.precio.toLocaleString()}
                        </option>
                      ))}
                    </datalist>
                    
                    <button 
                      className="boton boton-agregar"
                      onClick={agregarServicioTrabajo}
                      disabled={!servicioSeleccionado}
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </div>

              {/* NOTAS DE DIAGNÓSTICO */}
              <div className="seccion-notas">
                <h4>Notas de Diagnóstico</h4>
                <div className="lista-notas">
                  {selected.notasDiagnostico?.map((nota) => (
                    <div key={nota.id} className="nota-item">
                      <div className="nota-header">
                        <span className="nota-fecha">{nota.fecha}</span>
                        <button 
                          className="boton boton-eliminar-pequeno"
                          onClick={() => eliminarNotaDiagnostico(nota.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                      <div className="nota-texto">{nota.texto}</div>
                    </div>
                  ))}
                  {(!selected.notasDiagnostico || selected.notasDiagnostico.length === 0) && (
                    <p className="no-items">No hay notas de diagnóstico</p>
                  )}
                </div>
                
                <div className="agregar-nota-form">
                  <textarea
                    placeholder="Escriba una nueva nota de diagnóstico..."
                    value={nuevaNotaDiagnostico}
                    onChange={e => setNuevaNotaDiagnostico(e.target.value)}
                    rows={3}
                  />
                  <button 
                    className="boton boton-agregar"
                    onClick={agregarNotaDiagnostico}
                    disabled={!nuevaNotaDiagnostico.trim()}
                  >
                    Agregar Nota
                  </button>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <div className="total-resumen">
                <span className="total-label">Total de la Orden:</span>
                <span className="total-valor">₡{calcularTotal(selected).toLocaleString()}</span>
              </div>
              
              <div className="acciones-finales">
                <button className="boton boton-guardar" onClick={guardarDetalleTrabajo}>
                  Guardar Cambios
                </button>
                <button className="boton boton-cancelar" onClick={cerrarModales}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CAMBIAR ESTADO */}
      {showModalEstado && selected && (
        <div className="modal-overlay" onClick={cerrarModales}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cambiar Estado - {selected.codigoOrden}</h3>
              <button className="btn-close" onClick={cerrarModales}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Seleccionar Nuevo Estado</label>
                <select
                  value={estadoSeleccionado}
                  onChange={e => setEstadoSeleccionado(e.target.value)}
                >
                  {ESTADOS.map(estado => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="boton boton-guardar" onClick={guardarNuevoEstado}>
                Actualizar Estado
              </button>
              <button className="boton boton-cancelar" onClick={cerrarModales}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VER NOTA COMPLETA */}
      {showModalNota && notaSeleccionada && (
        <div className="modal-overlay" onClick={cerrarModales}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nota de Diagnóstico</h3>
              <button className="btn-close" onClick={cerrarModales}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="nota-completa">
                <div className="nota-meta">
                  <p><strong>Fecha:</strong> {notaSeleccionada.fecha}</p>
                </div>
                <div className="nota-contenido">
                  {notaSeleccionada.texto}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="boton boton-cancelar" onClick={cerrarModales}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionTrabajos;