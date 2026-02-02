// src/pages/GestionTrabajos.tsx - VERSIÓN CORREGIDA
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import '../styles/pages/GestionTrabajos.css';
import '../styles/Botones.css';
import { ordenesTrabajoService } from '../services/orden-trabajo.service';
import { inventarioService } from '../services/inventario.service';
import { serviciosService } from '../services/servicio.service';

// Interfaces adaptadas a la BD
interface Trabajo {
  id: number;
  codigoOrden: string;
  clienteNombre: string;
  clienteCedula: string;
  placa: string;
  marca?: string;
  modelo?: string;
  fechaCreacion: string;
  estado: 'Pendiente' | 'En proceso' | 'Finalizada' | 'Cancelada';
  observacionesIniciales: string;
  repuestosUtilizados?: RepuestoUtilizado[];
  serviciosRealizados?: ServicioRealizado[];
  notasDiagnostico?: NotaDiagnostico[];
  citaId?: number;
  total?: number;
}

interface RepuestoUtilizado {
  id: number;
  codigo: string;
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
  producto_codigo: string;
}

interface ServicioRealizado {
  id: number;
  codigo: string;
  nombre: string;
  precio: number;
  descripcion: string;
  servicio_codigo: string;
}

interface NotaDiagnostico {
  id: number;
  texto: string;
  fecha: string;
  usuario_id?: number;
}

// Interface para citas disponibles
interface CitaDisponible {
  id: number;
  cliente_nombre: string;
  cliente_cedula: string;
  vehiculo_placa: string;
  vehiculo_marca?: string;
  vehiculo_modelo?: string;
  fecha: string;
  hora: string;
  descripcion: string;
  usuario_nombre?: string;
}

// Interface para producto de inventario
interface Producto {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  cantidad: number;
  cantidad_minima: number;
  precio_compra: number;
  precio_venta: number;
  proveedor?: string;
  created_at?: string;
}

// Interface para servicio
interface Servicio {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  precio_base: number;
  tiempo_estimado_minutos: number;
  estado: 'Activo' | 'Inactivo';
  created_at?: string;
  updated_at?: string;
}

const GestionTrabajos: React.FC<{ session: any }> = ({ session }) => {
  // Estados principales
  const [trabajos, setTrabajos] = useState<Trabajo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para inventario y servicios
  const [inventario, setInventario] = useState<Producto[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [citasDisponibles, setCitasDisponibles] = useState<CitaDisponible[]>([]);
  
  // Estados para búsqueda y selección
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Trabajo | null>(null);
  const [showModalNuevaOT, setShowModalNuevaOT] = useState(false);
  const [showModalDetalle, setShowModalDetalle] = useState(false);
  const [showModalEstado, setShowModalEstado] = useState(false);
  
  // Estados para nueva orden
  const [newOT, setNewOT] = useState({
    citaId: '',
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

  /* === FUNCIONES PARA CARGAR DATOS === */
  const cargarTrabajos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ordenesTrabajoService.getOrdenes(search);
      
      if (response.success) {
        const trabajosTransformados = response.data.map(transformarOrdenBD);
        setTrabajos(trabajosTransformados);
      } else {
        setError(response.message || 'Error al cargar órdenes');
      }
    } catch (error: any) {
      console.error('Error cargando trabajos:', error);
      setError('Error al cargar órdenes de trabajo: ' + (error.message || 'Error desconocido'));
      setTrabajos([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  const cargarInventario = useCallback(async () => {
    try {
      const response = await inventarioService.getProductos();
      if (response.success) {
        setInventario(response.data);
      }
    } catch (error) {
      console.error('Error cargando inventario:', error);
    }
  }, []);

  const cargarServicios = useCallback(async () => {
    try {
      const response = await serviciosService.getServicios();
      if (response.success) {
        setServicios(response.data);
      }
    } catch (error) {
      console.error('Error cargando servicios:', error);
    }
  }, []);

  const cargarCitasDisponibles = useCallback(async () => {
    try {
      // Si es admin, no enviamos usuarioId, si es mecánico enviamos su ID
      const usuarioId = session.rol !== 'admin' ? session.id : undefined;
      const response = await ordenesTrabajoService.getCitasDisponiblesParaOrden(usuarioId);
      
      if (response.success) {
        setCitasDisponibles(response.data);
      }
    } catch (error) {
      console.error('Error cargando citas disponibles:', error);
      setCitasDisponibles([]);
    }
  }, [session]);

  /* === CARGAR DATOS INICIALES === */
  useEffect(() => {
    cargarTrabajos();
    cargarInventario();
    cargarServicios();
    cargarCitasDisponibles();
  }, [cargarTrabajos, cargarInventario, cargarServicios, cargarCitasDisponibles]);

  /* === TRANSFORMAR DATOS DE BD === */
  const transformarOrdenBD = (ordenBD: any): Trabajo => {
    return {
      id: ordenBD.id || 0,
      codigoOrden: ordenBD.codigo_orden || `OT-${ordenBD.id}`,
      clienteNombre: ordenBD.cliente_nombre || ordenBD.cliente?.nombre || 'Cliente no encontrado',
      clienteCedula: ordenBD.cliente_cedula || ordenBD.cliente?.cedula || '',
      placa: ordenBD.vehiculo_placa || ordenBD.vehiculo?.placa || 'Sin placa',
      marca: ordenBD.vehiculo_marca || ordenBD.vehiculo?.marca,
      modelo: ordenBD.vehiculo_modelo || ordenBD.vehiculo?.modelo,
      fechaCreacion: ordenBD.fecha_creacion || ordenBD.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      estado: ordenBD.estado || 'Pendiente',
      observacionesIniciales: ordenBD.observaciones_iniciales || '',
      citaId: ordenBD.cita_id,
      total: ordenBD.total || 0,
      
      repuestosUtilizados: ordenBD.repuestos_utilizados?.map((rep: any) => ({
        id: rep.id || 0,
        codigo: rep.producto_codigo || rep.codigo,
        nombre: rep.producto_nombre || rep.nombre || 'Repuesto',
        cantidad: rep.cantidad || 1,
        precio: rep.precio_unitario || rep.precio || 0,
        subtotal: rep.subtotal || (rep.cantidad * rep.precio_unitario) || 0,
        producto_codigo: rep.producto_codigo || rep.codigo
      })) || [],
      
      serviciosRealizados: ordenBD.servicios_realizados?.map((serv: any) => ({
        id: serv.id || 0,
        codigo: serv.servicio_codigo || serv.codigo,
        nombre: serv.servicio_nombre || serv.nombre || 'Servicio',
        precio: serv.precio || 0,
        descripcion: serv.descripcion || '',
        servicio_codigo: serv.servicio_codigo || serv.codigo
      })) || [],
      
      notasDiagnostico: ordenBD.notas_diagnostico?.map((nota: any) => ({
        id: nota.id || 0,
        texto: nota.texto || '',
        fecha: nota.fecha || nota.created_at || new Date().toLocaleString(),
        usuario_id: nota.usuario_id
      })) || []
    };
  };

  /* === FUNCIONES PARA ACTUALIZAR DATOS === */
  const actualizarRepuestosConNombres = useCallback((trabajo: Trabajo): Trabajo => {
    const trabajoActualizado = { ...trabajo };
    
    if (trabajoActualizado.repuestosUtilizados) {
      trabajoActualizado.repuestosUtilizados = trabajoActualizado.repuestosUtilizados.map(rep => {
        const producto = inventario.find(p => p.codigo === rep.producto_codigo);
        return {
          ...rep,
          nombre: producto?.nombre || rep.nombre
        };
      });
    }
    
    if (trabajoActualizado.serviciosRealizados) {
      trabajoActualizado.serviciosRealizados = trabajoActualizado.serviciosRealizados.map(serv => {
        const servicio = servicios.find(s => s.codigo === serv.servicio_codigo);
        return {
          ...serv,
          nombre: servicio?.nombre || serv.nombre,
          descripcion: servicio?.descripcion || serv.descripcion
        };
      });
    }
    
    return trabajoActualizado;
  }, [inventario, servicios]);

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

  /* === CREAR ORDEN DESDE CITA === */
  const crearOrdenDesdeCita = async () => {
    const { citaId, observacionesIniciales } = newOT;
    
    if (!citaId) {
      alert('Debe seleccionar una cita');
      return;
    }

    try {
      setLoading(true);
      
      // Obtener usuarioId de la sesión
      const usuarioId = session.rol !== 'admin' ? session.id : undefined;
      
      const response = await ordenesTrabajoService.createOrdenFromCita(
        parseInt(citaId), 
        observacionesIniciales.trim() || 'Sin observaciones iniciales',
        usuarioId
      );
      
      if (response.success) {
        // Recargar datos
        await cargarTrabajos();
        await cargarCitasDisponibles();
        
        setNewOT({ citaId: '', observacionesIniciales: '' });
        setShowModalNuevaOT(false);
        
        alert(`Orden creada exitosamente`);
      } else {
        alert(response.message || 'Error al crear la orden');
      }
    } catch (error: any) {
      console.error('Error creando orden:', error);
      alert('Error al crear la orden: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  /* === AGREGAR REPUESTO A ORDEN === */
  const agregarRepuestoTrabajo = async () => {
    if (!selected || !repSeleccionado) return;

    try {
      const producto = inventario.find(r => r.codigo === repSeleccionado);
      if (!producto) {
        alert('Repuesto no encontrado');
        return;
      }

      if (cantidadRep > producto.cantidad) {
        alert(`No hay suficiente stock. Stock disponible: ${producto.cantidad}`);
        return;
      }

      const repuestoData = {
        producto_codigo: repSeleccionado,
        cantidad: cantidadRep,
        precio_unitario: producto.precio_venta
      };

      const response = await ordenesTrabajoService.addRepuestoOrden(selected.id, repuestoData);
      
      if (response.success) {
        // Actualizar el trabajo seleccionado
        const trabajoActualizado = await cargarOrdenCompleta(selected.id);
        if (trabajoActualizado) {
          setSelected(actualizarRepuestosConNombres(trabajoActualizado));
        }
        
        // Actualizar inventario localmente (disminuir stock)
        setInventario(prev => prev.map(p => 
          p.codigo === repSeleccionado 
            ? { ...p, cantidad: p.cantidad - cantidadRep }
            : p
        ));
        
        // Limpiar formulario
        setRepSeleccionado('');
        setCantidadRep(1);
        
        alert('Repuesto agregado exitosamente');
      } else {
        alert(response.message || 'Error al agregar repuesto');
      }
    } catch (error: any) {
      console.error('Error agregando repuesto:', error);
      alert('Error al agregar repuesto: ' + (error.message || 'Error desconocido'));
    }
  };

  /* === ELIMINAR REPUESTO === */
  const eliminarRepuesto = async (repuestoId: number, repuestoCodigo: string, cantidad: number) => {
    if (!selected) return;

    if (!confirm('¿Está seguro de eliminar este repuesto?')) return;

    try {
      const response = await ordenesTrabajoService.deleteRepuestoOrden(selected.id, repuestoId);
      
      if (response.success) {
        // Actualizar el trabajo seleccionado
        const trabajoActualizado = await cargarOrdenCompleta(selected.id);
        if (trabajoActualizado) {
          setSelected(actualizarRepuestosConNombres(trabajoActualizado));
        }
        
        // Actualizar inventario localmente (aumentar stock)
        setInventario(prev => prev.map(p => 
          p.codigo === repuestoCodigo 
            ? { ...p, cantidad: p.cantidad + cantidad }
            : p
        ));
        
        alert('Repuesto eliminado exitosamente');
      } else {
        alert(response.message || 'Error al eliminar repuesto');
      }
    } catch (error: any) {
      console.error('Error eliminando repuesto:', error);
      alert('Error al eliminar repuesto: ' + (error.message || 'Error desconocido'));
    }
  };

  /* === AGREGAR SERVICIO A ORDEN === */
  const agregarServicioTrabajo = async () => {
    if (!selected || !servicioSeleccionado) return;

    try {
      const servicio = servicios.find(s => s.codigo === servicioSeleccionado);
      if (!servicio) {
        alert('Servicio no encontrado');
        return;
      }

      const servicioData = {
        servicio_codigo: servicioSeleccionado,
        precio: servicio.precio_base,
        descripcion: servicio.descripcion || ''
      };

      const response = await ordenesTrabajoService.addServicioOrden(selected.id, servicioData);
      
      if (response.success) {
        // Actualizar el trabajo seleccionado
        const trabajoActualizado = await cargarOrdenCompleta(selected.id);
        if (trabajoActualizado) {
          setSelected(actualizarRepuestosConNombres(trabajoActualizado));
        }
        
        setServicioSeleccionado('');
        alert('Servicio agregado exitosamente');
      } else {
        alert(response.message || 'Error al agregar servicio');
      }
    } catch (error: any) {
      console.error('Error agregando servicio:', error);
      alert('Error al agregar servicio: ' + (error.message || 'Error desconocido'));
    }
  };

  /* === ELIMINAR SERVICIO === */
  const eliminarServicio = async (servicioId: number) => {
    if (!selected) return;

    if (!confirm('¿Está seguro de eliminar este servicio?')) return;

    try {
      const response = await ordenesTrabajoService.deleteServicioOrden(selected.id, servicioId);
      
      if (response.success) {
        // Actualizar el trabajo seleccionado
        const trabajoActualizado = await cargarOrdenCompleta(selected.id);
        if (trabajoActualizado) {
          setSelected(actualizarRepuestosConNombres(trabajoActualizado));
        }
        
        alert('Servicio eliminado exitosamente');
      } else {
        alert(response.message || 'Error al eliminar servicio');
      }
    } catch (error: any) {
      console.error('Error eliminando servicio:', error);
      alert('Error al eliminar servicio: ' + (error.message || 'Error desconocido'));
    }
  };

  /* === AGREGAR NOTA DE DIAGNÓSTICO === */
  const agregarNotaDiagnostico = async () => {
    if (!selected || !nuevaNotaDiagnostico.trim()) return;

    try {
      const notaData = {
        texto: nuevaNotaDiagnostico.trim(),
        usuario_id: session.id
      };

      const response = await ordenesTrabajoService.addNotaDiagnostico(selected.id, notaData);
      
      if (response.success) {
        // Actualizar el trabajo seleccionado
        const trabajoActualizado = await cargarOrdenCompleta(selected.id);
        if (trabajoActualizado) {
          setSelected(trabajoActualizado);
        }
        
        setNuevaNotaDiagnostico('');
        alert('Nota agregada exitosamente');
      } else {
        alert(response.message || 'Error al agregar nota');
      }
    } catch (error: any) {
      console.error('Error agregando nota:', error);
      alert('Error al agregar nota: ' + (error.message || 'Error desconocido'));
    }
  };

  /* === ELIMINAR NOTA === */
  const eliminarNotaDiagnostico = async (notaId: number) => {
    if (!selected) return;

    if (!confirm('¿Está seguro de eliminar esta nota?')) return;

    try {
      const response = await ordenesTrabajoService.deleteNotaDiagnostico(selected.id, notaId);
      
      if (response.success) {
        // Actualizar el trabajo seleccionado
        const trabajoActualizado = await cargarOrdenCompleta(selected.id);
        if (trabajoActualizado) {
          setSelected(trabajoActualizado);
        }
        
        alert('Nota eliminada exitosamente');
      } else {
        alert(response.message || 'Error al eliminar nota');
      }
    } catch (error: any) {
      console.error('Error eliminando nota:', error);
      alert('Error al eliminar nota: ' + (error.message || 'Error desconocido'));
    }
  };

  /* === CARGA DE ORDEN COMPLETA === */
  const cargarOrdenCompleta = async (ordenId: number): Promise<Trabajo | null> => {
    try {
      const response = await ordenesTrabajoService.getOrdenById(ordenId);
      if (response.success) {
        return actualizarRepuestosConNombres(transformarOrdenBD(response.data));
      }
    } catch (error) {
      console.error('Error cargando orden completa:', error);
    }
    return null;
  };

  /* === GUARDAR CAMBIOS DE ORDEN === */
  const guardarDetalleTrabajo = async () => {
    if (!selected) return;

    try {
      const updateData = {
        observaciones_iniciales: selected.observacionesIniciales,
        estado: selected.estado
      };

      const response = await ordenesTrabajoService.updateOrden(selected.id, updateData);
      
      if (response.success) {
        // Recargar trabajos
        await cargarTrabajos();
        
        setShowModalDetalle(false);
        alert('Orden actualizada correctamente');
      } else {
        alert(response.message || 'Error al actualizar orden');
      }
    } catch (error: any) {
      console.error('Error guardando orden:', error);
      alert('Error al actualizar orden: ' + (error.message || 'Error desconocido'));
    }
  };

  /* === CAMBIAR ESTADO === */
  const guardarNuevoEstado = async () => {
    if (!selected) return;

    try {
      const response = await ordenesTrabajoService.updateEstadoOrden(selected.id, estadoSeleccionado);
      
      if (response.success) {
        // Actualizar trabajo localmente
        const trabajoActualizado = { ...selected, estado: estadoSeleccionado as Trabajo['estado'] };
        setSelected(trabajoActualizado);
        
        // Recargar lista
        await cargarTrabajos();
        
        setShowModalEstado(false);
        alert('Estado actualizado correctamente');
      } else {
        alert(response.message || 'Error al actualizar estado');
      }
    } catch (error: any) {
      console.error('Error cambiando estado:', error);
      alert('Error al actualizar estado: ' + (error.message || 'Error desconocido'));
    }
  };

  /* === CERRAR MODALES === */
  const cerrarModales = () => {
    if (showModalDetalle) setShowModalDetalle(false);
    if (showModalNuevaOT) setShowModalNuevaOT(false);
    if (showModalEstado) setShowModalEstado(false);
  };

  /* === CALCULAR TOTAL === */
  const calcularTotal = (trabajo: Trabajo) => {
    if (trabajo.total !== undefined && trabajo.total > 0) {
      return trabajo.total;
    }
    
    let total = 0;
    
    if (trabajo.repuestosUtilizados) {
      total += trabajo.repuestosUtilizados.reduce((sum, rep) => sum + rep.subtotal, 0);
    }
    
    if (trabajo.serviciosRealizados) {
      total += trabajo.serviciosRealizados.reduce((sum, serv) => sum + serv.precio, 0);
    }
    
    return total;
  };

  /* === RENDERIZADO === */
  return (
    <div className="gestion-trabajos">
      <div className="header-section">
        <div className="stats">
          <span className="stat-item">Total: {trabajos.length} órdenes</span>
          <span className="stat-item">Mostrando: {trabajosFiltrados.length}</span>
          <span className="stat-item">Pendientes: {trabajos.filter(t => t.estado === 'Pendiente').length}</span>
          {loading && <span className="stat-item">Cargando...</span>}
          {error && <span className="stat-item error">Error: {error}</span>}
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
              disabled={loading}
            />
            <button
              className="boton boton-agregar boton-grande"
              onClick={() => {
                setShowModalNuevaOT(true);
                setNewOT({ citaId: '', observacionesIniciales: '' });
              }}
              disabled={loading}
            >
              <span className="icono">+</span>
              Nueva Orden desde Cita
            </button>
          </div>

          {/* TABLA DE TRABAJOS */}
          <div className="table-container">
            {loading ? (
              <div className="loading">Cargando órdenes...</div>
            ) : (
              <>
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
                        key={trabajo.id}
                        className={selected?.id === trabajo.id ? 'selected-row' : ''}
                        onClick={async () => {
                          // Cargar datos completos de la orden
                          const ordenCompleta = await cargarOrdenCompleta(trabajo.id);
                          if (ordenCompleta) {
                            setSelected(ordenCompleta);
                            setEstadoSeleccionado(ordenCompleta.estado);
                          }
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
              </>
            )}
          </div>
        </div>

        {/* CONTENEDOR DERECHO - DETALLES */}
        {selected && !showModalDetalle && (
          <div className="contenedor-detalles">
            <div className="sidebar-details">
              <div className="sidebar-header">
                <h4>Detalles de Orden</h4>
                <button className="btn-close" onClick={() => setSelected(null)} disabled={loading}>×</button>
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
                  <span className="detail-label">Vehículo:</span>
                  <span className="detail-value">
                    {selected.placa} 
                    {selected.marca && ` (${selected.marca} ${selected.modelo || ''})`}
                  </span>
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
                  disabled={loading}
                >
                  Editar Orden
                </button>
                <button 
                  className="boton boton-editar"
                  onClick={() => {
                    setEstadoSeleccionado(selected.estado);
                    setShowModalEstado(true);
                  }}
                  disabled={loading}
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
        <div className="modal-overlay" onClick={() => !loading && cerrarModales()}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nueva Orden desde Cita</h3>
              <button className="btn-close" onClick={cerrarModales} disabled={loading}>×</button>
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
                  value={newOT.citaId}
                  onChange={e => setNewOT({ ...newOT, citaId: e.target.value })}
                  className={!newOT.citaId ? 'input-error' : ''}
                  disabled={loading || citasDisponibles.length === 0}
                >
                  <option value="">Seleccione una cita</option>
                  {citasDisponibles.map((cita) => (
                    <option key={cita.id} value={cita.id}>
                      Cita #{cita.id} - {cita.cliente_nombre} ({cita.vehiculo_placa}) - {cita.fecha} {cita.hora}
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
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="boton boton-guardar" 
                onClick={crearOrdenDesdeCita}
                disabled={!newOT.citaId || loading || citasDisponibles.length === 0}
              >
                {loading ? 'Creando...' : 'Crear Orden'}
              </button>
              <button className="boton boton-cancelar" onClick={cerrarModales} disabled={loading}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE ORDEN */}
      {showModalDetalle && selected && (
        <div className="modal-overlay" onClick={() => !loading && cerrarModales()}>
          <div className="modal modal-grande" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Orden #{selected.codigoOrden}</h3>
              <button className="btn-close" onClick={cerrarModales} disabled={loading}>×</button>
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
                    <label>Vehículo:</label>
                    <span>
                      {selected.placa} 
                      {selected.marca && ` (${selected.marca} ${selected.modelo || ''})`}
                    </span>
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
                    disabled={loading}
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
                      {selected.repuestosUtilizados?.map((repuesto) => (
                        <tr key={repuesto.id}>
                          <td>{repuesto.codigo}</td>
                          <td>{repuesto.nombre}</td>
                          <td>{repuesto.cantidad}</td>
                          <td>₡{repuesto.precio.toLocaleString()}</td>
                          <td>₡{repuesto.subtotal.toLocaleString()}</td>
                          <td>
                            <button 
                              className="boton boton-eliminar-pequeno"
                              onClick={() => eliminarRepuesto(repuesto.id, repuesto.producto_codigo, repuesto.cantidad)}
                              disabled={loading}
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
                      disabled={loading}
                    />
                    <datalist id="repuestos-lista">
                      {inventario
                        .filter(producto => producto.cantidad > 0)
                        .map(producto => (
                          <option key={producto.codigo} value={producto.codigo}>
                            {producto.nombre} (Stock: {producto.cantidad})
                          </option>
                        ))
                      }
                    </datalist>
                    
                    <input
                      type="number"
                      min="1"
                      max={inventario.find(p => p.codigo === repSeleccionado)?.cantidad || 1}
                      placeholder="Cantidad"
                      value={cantidadRep}
                      onChange={e => {
                        const maxStock = inventario.find(p => p.codigo === repSeleccionado)?.cantidad || 1;
                        const value = parseInt(e.target.value) || 1;
                        setCantidadRep(Math.min(value, maxStock));
                      }}
                      disabled={loading || !repSeleccionado}
                    />
                    
                    <button 
                      className="boton boton-agregar"
                      onClick={agregarRepuestoTrabajo}
                      disabled={!repSeleccionado || cantidadRep < 1 || loading}
                    >
                      {loading ? 'Agregando...' : 'Agregar'}
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
                      {selected.serviciosRealizados?.map((servicio) => (
                        <tr key={servicio.id}>
                          <td>{servicio.codigo}</td>
                          <td>{servicio.nombre}</td>
                          <td>{servicio.descripcion}</td>
                          <td>₡{servicio.precio.toLocaleString()}</td>
                          <td>
                            <button 
                              className="boton boton-eliminar-pequeno"
                              onClick={() => eliminarServicio(servicio.id)}
                              disabled={loading}
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
                      disabled={loading}
                    />
                    <datalist id="servicios-lista">
                      {servicios.map(serv => (
                        <option key={serv.codigo} value={serv.codigo}>
                          {serv.nombre} - ₡{serv.precio_base.toLocaleString()}
                        </option>
                      ))}
                    </datalist>
                    
                    <button 
                      className="boton boton-agregar"
                      onClick={agregarServicioTrabajo}
                      disabled={!servicioSeleccionado || loading}
                    >
                      {loading ? 'Agregando...' : 'Agregar'}
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
                          disabled={loading}
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
                    disabled={loading}
                  />
                  <button 
                    className="boton boton-agregar"
                    onClick={agregarNotaDiagnostico}
                    disabled={!nuevaNotaDiagnostico.trim() || loading}
                  >
                    {loading ? 'Agregando...' : 'Agregar Nota'}
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
                <button className="boton boton-guardar" onClick={guardarDetalleTrabajo} disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button className="boton boton-cancelar" onClick={cerrarModales} disabled={loading}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CAMBIAR ESTADO */}
      {showModalEstado && selected && (
        <div className="modal-overlay" onClick={() => !loading && cerrarModales()}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cambiar Estado - {selected.codigoOrden}</h3>
              <button className="btn-close" onClick={cerrarModales} disabled={loading}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Seleccionar Nuevo Estado</label>
                <select
                  value={estadoSeleccionado}
                  onChange={e => setEstadoSeleccionado(e.target.value)}
                  disabled={loading}
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
              <button className="boton boton-guardar" onClick={guardarNuevoEstado} disabled={loading}>
                {loading ? 'Actualizando...' : 'Actualizar Estado'}
              </button>
              <button className="boton boton-cancelar" onClick={cerrarModales} disabled={loading}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionTrabajos;