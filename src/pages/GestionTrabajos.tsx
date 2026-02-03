import React, { useState, useMemo, useEffect } from 'react';
import '../styles/pages/GestionTrabajos.css';
import '../styles/Botones.css';
import { useToast } from '../components/ToastContainer';
import { ordenTrabajoService, type OrdenTrabajo } from '../services/ordenTrabajo.service';
import { citaService, type Cita } from '../services/cita.service';
import { inventarioService, type Producto } from '../services/inventario.service';
//import { clienteService } from '../services/cliente.service';
import { vehiculoClienteService, type VehiculoClienteCompleto } from '../services/vehiculo_cliente.service';

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
    codigo: string;  // SIN id aquí
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
  _ordenId?: number;
  _vehiculoClienteId?: number;
  _citaId?: number;
}

// Interface Cita extendida para frontend
interface CitaFrontend extends Omit<Cita, 'id'> {
  id?: number;
  idFormateado: string; // Siempre tendrá un valor formateado
  clienteNombre?: string;
  clienteCedula?: string;
  vehiculoPlaca?: string;
  mecanico?: string;
}

const GestionTrabajos: React.FC<{ session: any }> = ({ session }) => {
  const { showToast } = useToast();
  
  // Estados para datos del API
  const [trabajos, setTrabajos] = useState<Trabajo[]>([]);
  const [citasReales, setCitasReales] = useState<CitaFrontend[]>([]);
  const [inventario, setInventario] = useState<Producto[]>([]);
  const [vehiculosClientes, setVehiculosClientes] = useState<VehiculoClienteCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCitas, setLoadingCitas] = useState(false);
  const [loadingInventario, setLoadingInventario] = useState(false);
  const [error, setError] = useState<string | null>(null);
   vehiculosClientes;
  // Datos mockeados de servicios (como solicitaste, NO cambiar esto)
  const [manoDeObra] = useState([
    { codigo: 'S001', nombre: 'Cambio de Aceite', precio: 15000, descripcion: 'Cambio completo de aceite' },
    { codigo: 'S002', nombre: 'Revisión de Frenos', precio: 20000, descripcion: 'Revisión completa del sistema de frenos' },
    { codigo: 'S003', nombre: 'Cambio de Pastillas', precio: 15000, descripcion: 'Cambio de pastillas delanteras' },
    { codigo: 'S004', nombre: 'Alineación', precio: 12000, descripcion: 'Alineación de las 4 ruedas' },
    { codigo: 'S005', nombre: 'Balanceo', precio: 10000, descripcion: 'Balanceo de ruedas' },
    { codigo: 'S006', nombre: 'Cambio de Batería', precio: 10000, descripcion: 'Cambio e instalación de batería' }
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

  // Cargar todos los datos necesarios
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      await Promise.all([
        cargarOrdenes(),
        cargarCitas(),
        cargarInventario(),
        cargarVehiculosClientes()
      ]);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const cargarOrdenes = async () => {
  try {
    setError(null);
    const response = await ordenTrabajoService.getOrdenes();
    
    if (response.success && response.data) {
      const trabajosConvertidos: Trabajo[] = response.data.map(orden => ({
        codigoOrden: `OT-${String(orden.id).padStart(3, '0')}`,
        clienteNombre: orden.cliente_nombre || 'N/A',
        clienteCedula: orden.cliente_cedula || 'N/A',
        placa: orden.vehiculo_placa || 'N/A',
        fechaCreacion: orden.fecha_entrada ? new Date(orden.fecha_entrada).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        estado: mapEstadoFromAPI(orden.estado),
        observacionesIniciales: orden.descripcion || 'Sin observaciones',
        repuestosUtilizados: [],
        serviciosRealizados: orden.servicio_nombre ? [{
          codigo: `S${orden.servicio_id || '000'}`,
          nombre: orden.servicio_nombre,
          precio: orden.costo || 0,
          descripcion: orden.tipo_servicio || ''
        }] : [],
        notasDiagnostico: orden.notas ? [{
          id: orden.id || 0,
          texto: orden.notas,
          fecha: orden.created_at ? new Date(orden.created_at).toLocaleString('es-ES') : ''
        }] : [],
        _ordenId: orden.id,
        _vehiculoClienteId: orden.vehiculo_cliente_id
      }));
      
      setTrabajos(trabajosConvertidos);
    } else {
      setError(response.error || 'Error al cargar órdenes de trabajo');
    }
  } catch (err) {
    console.error('Error cargando órdenes:', err);
    setError('Error de conexión al cargar órdenes de trabajo');
  }
};

const cargarCitas = async () => {
  try {
    setLoadingCitas(true);
    const response = await citaService.getCitas({ estado: 'Aceptada' });
    
    if (response.success && response.data) {
      const citasFormateadas: CitaFrontend[] = response.data.map(cita => ({
        ...cita,
        idFormateado: `CITA-${String(cita.id).padStart(3, '0')}`,
        clienteNombre: cita.cliente_nombre,
        clienteCedula: cita.cliente_cedula,
        vehiculoPlaca: cita.vehiculo_placa,
        mecanico: cita.mecanico_nombre
      }));
      
      setCitasReales(citasFormateadas);
    }
  } catch (err) {
    console.error('Error cargando citas:', err);
  } finally {
    setLoadingCitas(false);
  }
};

  const cargarInventario = async () => {
    try {
      setLoadingInventario(true);
      const response = await inventarioService.getProductos();
      
      if (response.success && response.data) {
        setInventario(response.data);
      }
    } catch (err) {
      console.error('Error cargando inventario:', err);
    } finally {
      setLoadingInventario(false);
    }
  };

  const cargarVehiculosClientes = async () => {
    try {
      const response = await vehiculoClienteService.getVehiculosClientes();
      
      if (response.success && response.data) {
        setVehiculosClientes(response.data);
      }
    } catch (err) {
      console.error('Error cargando vehículos de clientes:', err);
    }
  };

  // Obtener vehículo por ID
//  const obtenerVehiculoPorId = (id: number) => {
//    return vehiculosClientes.find(v => v.id === id);
//  };
//  obtenerVehiculoPorId(5);
  // Obtener cliente por ID
//  const obtenerClientePorId = async (id: number) => {
//    try {
      // Nota: Necesitamos una función en clienteService para obtener por ID
      // Por ahora usamos el array de vehículos que ya tiene la info del cliente
 //     const vehiculo = vehiculosClientes.find(v => v.cliente_id === id);
  //    if (vehiculo) {
  //      return {
   //       nombre: vehiculo.cliente_nombre,
   //       cedula: vehiculo.cliente_cedula
   //     };
   //   }
   //   return null;
   // } catch (err) {
    //  console.error('Error obteniendo cliente:', err);
     // return null;
   // }
 // };
 // obtenerClientePorId(5);
  const mapEstadoFromAPI = (estado: string): Trabajo['estado'] => {
    const mapaEstados: Record<string, Trabajo['estado']> = {
      'pendiente': 'Pendiente',
      'en_proceso': 'En proceso',
      'completado': 'Finalizada',
      'cancelado': 'Cancelada'
    };
    return mapaEstados[estado] || 'Pendiente';
  };

  const mapEstadoToAPI = (estado: Trabajo['estado']): OrdenTrabajo['estado'] => {
    const mapaEstados: Record<Trabajo['estado'], OrdenTrabajo['estado']> = {
      'Pendiente': 'pendiente',
      'En proceso': 'en_proceso',
      'Finalizada': 'completado',
      'Cancelada': 'cancelado'
    };
    return mapaEstados[estado];
  };

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
    if (loadingCitas) return [];
    
    // Filtrar citas aceptadas que no tienen orden de trabajo
    const citasSinOrden = citasReales.filter(cita => {
      // Buscar si ya hay una orden con esta cita
      const ordenExistente = trabajos.find(t => 
        t._citaId === cita.id || 
        // O buscar por vehículo y cliente similar
        (t.placa === cita.vehiculoPlaca && t.clienteCedula === cita.clienteCedula)
      );
      return !ordenExistente;
    });
    
    if (session.rol !== 'admin') {
      // Filtrar por mecánico asignado
      return citasSinOrden.filter(cita => 
        cita.mecanico === session.nombre
      );
    }
    
    return citasSinOrden;
  }, [citasReales, trabajos, session, loadingCitas]);

  /* === CREAR ORDEN DESDE CITA === */
const crearOrdenDesdeCita = async () => {
  const { codigoCita, observacionesIniciales } = newOT;
  
  if (!codigoCita) {
    showToast('Debe seleccionar una cita', 'warning');
    return;
  }

  const citaSeleccionada = citasReales.find(c => c.idFormateado === codigoCita);
  
  if (!citaSeleccionada || !citaSeleccionada.id) {
    showToast('Cita no encontrada', 'error');
    return;
  }

  const citaIdNumero = citaSeleccionada.id;

  if (session.rol !== 'admin' && citaSeleccionada.mecanico !== session.nombre) {
    showToast('No tienes permisos para crear una orden para esta cita', 'warning');
    return;
  }

  try {
    setLoading(true);
    
    const citaDetalleResponse = await citaService.getCitaById(citaIdNumero);
    
    if (!citaDetalleResponse.success || !citaDetalleResponse.data) {
      showToast('No se pudo obtener los detalles de la cita', 'error');
      return;
    }

    const citaDetalle = citaDetalleResponse.data;
    
    // ORDEN sin servicio asociado - se agregará después manualmente
    const nuevaOrden: Omit<OrdenTrabajo, 'id' | 'created_at' | 'updated_at'> = {
      vehiculo_cliente_id: citaDetalle.vehiculo_cliente_id,
      servicio_id: null, // Sin servicio asociado inicialmente
      tipo_servicio: 'Servicio general',
      descripcion: observacionesIniciales.trim() || `Orden desde cita ${citaSeleccionada.idFormateado}`,
      fecha_entrada: new Date().toISOString(),
      costo: 0,
      estado: 'pendiente',
      notas: observacionesIniciales.trim() || null
    };

    const response = await ordenTrabajoService.createOrden(nuevaOrden);
    
    if (response.success && response.data) {
      await citaService.updateEstado(citaIdNumero, 'Completada');
      
      // Recargar datos
      await cargarOrdenes();
      await cargarCitas();
      
      setNewOT({ codigoCita: '', observacionesIniciales: '' });
      setShowModalNuevaOT(false);
      showToast('Orden creada exitosamente', 'success');
    } else {
      showToast(response.error || 'Error al crear la orden de trabajo', 'error');
    }
  } catch (err) {
    console.error('Error creando orden:', err);
    showToast('Error de conexión al crear la orden', 'error');
  } finally {
    setLoading(false);
  }
};

  /* === AGREGAR REPUESTO A ORDEN === */
  const agregarRepuestoTrabajo = async () => {
    if (!selected || !repSeleccionado) return;

    try {
      // Buscar producto en inventario real
      const productoResponse = await inventarioService.getProductoByCodigo(repSeleccionado);
      
      if (!productoResponse.success || !productoResponse.data) {
        showToast('Repuesto no encontrado en el inventario', 'error');
        return;
      }

      const producto = productoResponse.data;
      
      if (cantidadRep > producto.cantidad) {
        showToast(`No hay suficiente stock. Stock disponible: ${producto.cantidad}`, 'warning');
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
        repuestoExistente.subtotal = repuestoExistente.cantidad * producto.precio_venta;
      } else {
        // Agregar nuevo
        trabajoActualizado.repuestosUtilizados.push({
          codigo: producto.codigo,
          nombre: producto.nombre,
          cantidad: cantidadRep,
          precio: producto.precio_venta,
          subtotal: producto.precio_venta * cantidadRep
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
      
      showToast('Repuesto agregado exitosamente', 'success');
      
      // Actualizar inventario (restar cantidad)
      // Nota: En un sistema real, deberías tener una función para esto
      // await inventarioService.updateProducto(repSeleccionado, {
      //   cantidad: producto.cantidad - cantidadRep
      // });
      
    } catch (err) {
      console.error('Error agregando repuesto:', err);
      showToast('Error al agregar el repuesto', 'error');
    }
  };

  /* === ELIMINAR REPUESTO === */
  const eliminarRepuesto = (index: number) => {
    if (!selected || !selected.repuestosUtilizados) return;

    const trabajoActualizado = { ...selected };
    const repuestoEliminado = trabajoActualizado.repuestosUtilizados?.[index];
    
    trabajoActualizado.repuestosUtilizados = trabajoActualizado.repuestosUtilizados?.filter((_, i) => i !== index);
    
    setSelected(trabajoActualizado);
    setTrabajos(trabajos.map(t => 
      t.codigoOrden === trabajoActualizado.codigoOrden ? trabajoActualizado : t
    ));

    // Aquí podrías devolver la cantidad al inventario si es necesario
    if (repuestoEliminado) {
      // await inventarioService.incrementarStock(repuestoEliminado.codigo, repuestoEliminado.cantidad);
    }
  };

  /* === AGREGAR SERVICIO A ORDEN === */
const agregarServicioTrabajo = () => {
  if (!selected || !servicioSeleccionado) return;

  const servicio = manoDeObra.find(s => s.codigo === servicioSeleccionado);
  if (!servicio) {
    showToast('Servicio no encontrado', 'error');
    return;
  }

  const trabajoActualizado = { ...selected };
  
  if (!trabajoActualizado.serviciosRealizados) {
    trabajoActualizado.serviciosRealizados = [];
  }

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
  showToast('Servicio agregado exitosamente', 'success');
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
  const guardarDetalleTrabajo = async () => {
  if (!selected || !selected._ordenId) {
    showToast('No se puede actualizar: orden no identificada', 'error');
    return;
  }

  try {
    setLoading(true);
    
    const costoTotal = calcularTotal(selected);
    
    // No enviar servicio_id si es null, solo descripción, costo y notas
    const datosActualizados: Partial<OrdenTrabajo> = {
      descripcion: selected.observacionesIniciales,
      costo: costoTotal,
      notas: selected.notasDiagnostico?.map(n => n.texto).join(' | ') || null
    };

    const response = await ordenTrabajoService.updateOrden(selected._ordenId, datosActualizados);
    
    if (response.success) {
      await cargarOrdenes();
      setShowModalDetalle(false);
      showToast('Orden actualizada correctamente', 'success');
    } else {
      showToast(response.error || 'Error al actualizar la orden', 'error');
    }
  } catch (err) {
    console.error('Error actualizando orden:', err);
    showToast('Error de conexión al actualizar la orden', 'error');
  } finally {
    setLoading(false);
  }
};

  /* === CAMBIAR ESTADO === */
  const guardarNuevoEstado = async () => {
    if (!selected || !selected._ordenId) {
      showToast('No se puede actualizar: orden no identificada', 'error');
      return;
    }

    try {
      setLoading(true);
      
      const estadoAPI = mapEstadoToAPI(estadoSeleccionado as Trabajo['estado']);
      const response = await ordenTrabajoService.updateEstado(selected._ordenId, estadoAPI);
      
      if (response.success) {
        await cargarOrdenes();
        setShowModalEstado(false);
        showToast('Estado actualizado correctamente', 'success');
      } else {
        showToast(response.error || 'Error al actualizar el estado', 'error');
      }
    } catch (err) {
      console.error('Error actualizando estado:', err);
      showToast('Error de conexión al actualizar el estado', 'error');
    } finally {
      setLoading(false);
    }
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

  /* === FORMATO DE MONEDA === */
  const formatoMoneda = (valor: number): string => {
    // Redondear a 2 decimales y formatear para Costa Rica
    const valorRedondeado = Math.round(valor * 100) / 100;
    return '₡' + new Intl.NumberFormat('es-CR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valorRedondeado);
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

      {/* MENSAJE DE ERROR */}
      {error && (
        <div className="alert alert-error">
          <p>{error}</p>
          <button className="boton boton-secundario" onClick={cargarDatos}>
            Reintentar
          </button>
        </div>
      )}

      {/* INDICADOR DE CARGA */}
      {(loading || loadingCitas || loadingInventario) && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            {loadingCitas ? 'Cargando citas...' : 
             loadingInventario ? 'Cargando inventario...' : 
             'Cargando datos...'}
          </div>
        </div>
      )}

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
              disabled={loadingCitas}
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
                    <td className="total-column">{formatoMoneda(calcularTotal(trabajo))}</td>
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
                  <span className="detail-value">{formatoMoneda(calcularTotal(selected))}</span>
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
                {loadingCitas ? (
                  <p>Cargando citas disponibles...</p>
                ) : (
                  <>
                    <select
                      value={newOT.codigoCita}
                      onChange={e => setNewOT({ ...newOT, codigoCita: e.target.value })}
                      className={!newOT.codigoCita ? 'input-error' : ''}
                    >
                      <option value="">Seleccione una cita</option>
                      {citasDisponibles.map((cita) => (
  <option key={cita.idFormateado} value={cita.idFormateado}>
    {cita.idFormateado} - {cita.clienteNombre} ({cita.vehiculoPlaca})
    {session.rol !== 'admin' && cita.mecanico && ` - Mecánico: ${cita.mecanico}`}
  </option>
))}

                    </select>
                    {citasDisponibles.length === 0 && (
                      <p className="warning-text">
                        {session.rol === 'admin' 
                          ? 'No hay citas aceptadas disponibles para generar órdenes.'
                          : 'No tienes citas aceptadas asignadas para generar órdenes.'
                        }
                      </p>
                    )}
                  </>
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
                disabled={!newOT.codigoCita || loadingCitas}
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
                          <td>{formatoMoneda(repuesto.precio)}</td>
                          <td>{formatoMoneda(repuesto.subtotal)}</td>
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
                      {inventario.map(producto => (
                        <option key={producto.codigo} value={producto.codigo}>
                          {producto.nombre} (Stock: {producto.cantidad})
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
                      disabled={!repSeleccionado || cantidadRep < 1 || loadingInventario}
                    >
                      {loadingInventario ? 'Cargando...' : 'Agregar'}
                    </button>
                  </div>
                  {loadingInventario && <p>Cargando inventario...</p>}
                </div>
              </div>

              {/* SERVICIOS REALIZADOS (mock) */}
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
                          <td>{formatoMoneda(servicio.precio)}</td>
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
                          {serv.nombre} - {formatoMoneda(serv.precio)}
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
                <span className="total-valor">{formatoMoneda(calcularTotal(selected))}</span>
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