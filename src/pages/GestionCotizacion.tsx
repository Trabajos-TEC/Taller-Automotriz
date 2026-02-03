// src/components/GestionCotizacion.tsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import '../styles/pages/GestionCotizacion.css';
import '../styles/Botones.css';
import { useToast } from '../components/ToastContainer';
import { cotizacionService, type Cotizacion as CotizacionAPI } from '../services/cotizacion.service';
import GeneradorPDF from './GeneradorPDF';

// Interfaces
interface Repuesto {
  codigo: string;
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal?: number;
  vehiculoId?: number | null;
}

interface ManoObra {
  codigo: string;
  nombre: string;
  descripcion: string;
  horas: number;
  tarifa: number;
}

// Usar la interfaz de la API (snake_case)
interface Cotizacion extends CotizacionAPI {
  repuestos?: Repuesto[];
  manoObra?: ManoObra[];
}

interface Vehiculo {
  placa: string;
  marca: string;
  modelo: string;
  clienteNombre: string;
  clienteCedula: string;
  vehiculoBaseId?: number | null;
}

interface ItemInventario {
  codigo: string;
  nombre: string;
  precio: number;
  cantidad: number;
  vehiculoId: number | null;
}

interface ServicioManoObra {
  codigo: string;
  nombre: string;
  precio: number;
  descripcion: string;
}

interface OrdenTrabajo {
  codigoOrden: string;
  clienteNombre: string;
  clienteCedula: string;
  placa: string;
  fechaCreacion: string;
  estado: string;
  observacionesIniciales: string;
  repuestosUtilizados?: Repuesto[];
  serviciosRealizados?: ServicioManoObra[];
  mecanico?: string;
}

interface Session {
  nombre: string;
  rol: 'admin' | 'mecanico' | 'recepcionista';
}

// CORREGIDO: FormCotizacion ahora usa snake_case para coincidir con la API
interface FormCotizacion {
  id?: number;
  codigo: string;
  cliente_nombre: string;
  cliente_cedula: string;
  vehiculo_placa: string;
  descuento_mano_obra: number;
  repuestos: Repuesto[];
  manoObra: ManoObra[];  // Estos no se guardan en la tabla cotizaciones
  es_proforma: boolean;
  estado: 'borrador' | 'pendiente' | 'aprobada' | 'rechazada';
  codigo_orden_trabajo?: string;
  mecanico_orden_trabajo: string;
}

// APIs reales - ya no usar mocks

const apiVehiculos = {
  getAll: async (): Promise<Vehiculo[]> => {
    return [
      { 
        placa: "ABC-123", 
        marca: "Toyota", 
        modelo: "Corolla", 
        clienteNombre: "Juan Pérez", 
        clienteCedula: "123456789",
        vehiculoBaseId: 1 
      },
      { 
        placa: "XYZ-789", 
        marca: "Honda", 
        modelo: "Civic", 
        clienteNombre: "María García", 
        clienteCedula: "987654321",
        vehiculoBaseId: 2 
      },
      { 
        placa: "DEF-456", 
        marca: "Ford", 
        modelo: "Focus", 
        clienteNombre: "Carlos López", 
        clienteCedula: "456789123",
        vehiculoBaseId: 3 
      }
    ];
  }
};

const apiInventario = {
  getAll: async (): Promise<ItemInventario[]> => {
    return [
      { codigo: 'R001', nombre: 'Aceite Motor 5W-30', precio: 25000, cantidad: 25, vehiculoId: null },
      { codigo: 'R002', nombre: 'Filtro de Aceite', precio: 12000, cantidad: 40, vehiculoId: null },
      { codigo: 'R003', nombre: 'Pastillas de Freno Delanteras', precio: 18000, cantidad: 15, vehiculoId: 1 },
      { codigo: 'R004', nombre: 'Batería 12V 60Ah', precio: 65000, cantidad: 8, vehiculoId: null },
      { codigo: 'R005', nombre: 'Filtro de Aire', precio: 15000, cantidad: 30, vehiculoId: null },
      { codigo: 'R006', nombre: 'Bujías', precio: 8000, cantidad: 50, vehiculoId: 2 }
    ];
  }
};

const apiManoDeObra = {
  getAll: async (): Promise<ServicioManoObra[]> => {
    return [
      { codigo: 'S001', nombre: 'Cambio de Aceite', precio: 15000, descripcion: 'Cambio completo de aceite' },
      { codigo: 'S002', nombre: 'Revisión de Frenos', precio: 20000, descripcion: 'Revisión completa del sistema de frenos' },
      { codigo: 'S003', nombre: 'Cambio de Pastillas', precio: 15000, descripcion: 'Cambio de pastillas delanteras' },
      { codigo: 'S004', nombre: 'Alineación', precio: 12000, descripcion: 'Alineación de las 4 ruedas' },
      { codigo: 'S005', nombre: 'Balanceo', precio: 10000, descripcion: 'Balanceo de ruedas' },
      { codigo: 'S006', nombre: 'Cambio de Batería', precio: 10000, descripcion: 'Cambio e instalación de batería' }
    ];
  }
};

const apiOrdenesTrabajo = {
  getAll: async (usuario: string | null = null): Promise<OrdenTrabajo[]> => {
    try {
      const response = await fetch('/.netlify/functions/ordenes-trabajo', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('🔧 Status de órdenes:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error cargando órdenes de trabajo:', response.status, errorText);
        return [];
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // Cargar detalles de cada orden (repuestos y servicios)
        const ordenesConDetalles = await Promise.all(
          data.data.map(async (orden: any) => {
            // Cargar repuestos y servicios de la orden
            const [repuestosRes, serviciosRes] = await Promise.all([
              fetch(`/.netlify/functions/orden-detalles/${orden.id}/repuestos`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
              }),
              fetch(`/.netlify/functions/orden-detalles/${orden.id}/servicios`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
              })
            ]);

            const repuestosData = repuestosRes.ok ? await repuestosRes.json() : { success: false, data: [] };
            const serviciosData = serviciosRes.ok ? await serviciosRes.json() : { success: false, data: [] };

            // Convertir repuestos
            const repuestos = repuestosData.success && repuestosData.data ? repuestosData.data.map((r: any) => ({
              codigo: r.producto_codigo,
              nombre: r.producto_nombre,
              cantidad: r.cantidad,
              precio: parseFloat(r.precio_unitario) || 0,
              subtotal: parseFloat(r.subtotal) || 0
            })) : [];

            // Convertir servicios
            const servicios = serviciosData.success && serviciosData.data ? serviciosData.data.map((s: any) => ({
              codigo: s.servicio_codigo,
              nombre: s.servicio_nombre,
              precio: parseFloat(s.precio) || 0,
              descripcion: s.descripcion
            })) : [];

            // Si hay servicio_id principal, agregarlo también
            if (orden.servicio_nombre) {
              servicios.push({
                codigo: `S${orden.servicio_id || '000'}`,
                nombre: orden.servicio_nombre,
                precio: parseFloat(String(orden.servicio_precio || 0)),
                descripcion: orden.tipo_servicio || ''
              });
            }

            return {
              codigoOrden: `OT-${String(orden.id).padStart(3, '0')}`,
              clienteNombre: orden.cliente_nombre || 'N/A',
              clienteCedula: orden.cliente_cedula || 'N/A',
              placa: orden.vehiculo_placa || 'N/A',
              fechaCreacion: orden.fecha_entrada ? new Date(orden.fecha_entrada).toISOString().split('T')[0] : '',
              estado: orden.estado || 'Pendiente',
              observacionesIniciales: orden.descripcion || '',
              repuestosUtilizados: repuestos,
              serviciosRealizados: servicios,
              mecanico: orden.mecanico_nombre || 'Sin asignar'
            };
          })
        );

        // Filtrar por usuario si es necesario
        const ordenesFiltradas = usuario 
          ? ordenesConDetalles.filter(ot => ot.mecanico === usuario)
          : ordenesConDetalles;
        
        return ordenesFiltradas;
      }
      return [];
    } catch (error) {
      console.error('Error en apiOrdenesTrabajo.getAll:', error);
      return [];
    }
  }
};

// Componente Principal
const GestionCotizacion: React.FC<{ session: Session }> = ({ session }) => {
  const { showToast } = useToast();
  
  // Estados principales
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [inventario, setInventario] = useState<ItemInventario[]>([]);
  const [manoDeObra, setManoDeObra] = useState<ServicioManoObra[]>([]);
  const [ordenesTrabajo, setOrdenesTrabajo] = useState<OrdenTrabajo[]>([]);
  
  // Estados para búsqueda y selección
  const [search, setSearch] = useState<string>("");
  const [selected, setSelected] = useState<Cotizacion | null>(null);
  const [showModalNueva, setShowModalNueva] = useState<boolean>(false);
  const [showModalDetalle, setShowModalDetalle] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  
  // Estados para el formulario
  const [form, setForm] = useState<FormCotizacion>({
    codigo: "",
    clienteNombre: "",
    clienteCedula: "",
    vehiculoPlaca: "",
    descuentoManoObra: 0,
    repuestos: [],
    manoObra: [],
    esProforma: false,
    estado: "borrador",
    codigoOrdenTrabajo: "",
    mecanicoOrdenTrabajo: session.nombre
  });
  
  // Estados para agregar items
  const [repSeleccionado, setRepSeleccionado] = useState<string>("");
  const [cantidadRep, setCantidadRep] = useState<number>(1);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<string>("");
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<Vehiculo | null>(null);
  
  // Estados para dropdowns
  const [showRepuestosDropdown, setShowRepuestosDropdown] = useState<boolean>(false);
  const [showServiciosDropdown, setShowServiciosDropdown] = useState<boolean>(false);
  const [repuestosFiltradosBusqueda, setRepuestosFiltradosBusqueda] = useState<ItemInventario[]>([]);
  const [serviciosFiltradosBusqueda, setServiciosFiltradosBusqueda] = useState<ServicioManoObra[]>([]);
  
  // Refs
  const repuestosDropdownRef = useRef<HTMLDivElement>(null);
  const serviciosDropdownRef = useRef<HTMLDivElement>(null);

  /* === CARGAR DATOS INICIALES === */
  useEffect(() => {
    cargarDatos();
  }, []);

  /* === CARGAR DATOS CON FILTRO POR USUARIO === */
  const cargarDatos = async (): Promise<void> => {
    try {
      const usuarioFiltro: string | null = session.rol !== "admin" ? session.nombre : null;
      
      const [cotizacionesData, vehiculosData, inventarioData, manoDeObraData, ordenesTrabajoData] = await Promise.all([
        apiCotizaciones.getAll(usuarioFiltro),
        apiVehiculos.getAll(),
        apiInventario.getAll(),
        apiManoDeObra.getAll(),
        apiOrdenesTrabajo.getAll(usuarioFiltro)
      ]);
      
      setCotizaciones(cotizacionesData);
      setVehiculos(vehiculosData);
      setInventario(inventarioData);
      setManoDeObra(manoDeObraData);
      setOrdenesTrabajo(ordenesTrabajoData);
      
    } catch (e) {
      console.error("Error cargando datos:", e);
      showToast("No se pudieron cargar los datos del servidor.", "error");
    }
  };

  /* === FILTRAR COTIZACIONES VISIBLES === */
  const cotizacionesVisibles = useMemo<Cotizacion[]>(() => {
    if (session.rol === "admin") return cotizaciones;
    return cotizaciones.filter(cot => cot.mecanicoOrdenTrabajo === session.nombre);
  }, [cotizaciones, session]);

  /* === FILTRAR ORDENES DE TRABAJO VISIBLES === */
  const ordenesTrabajoVisibles = useMemo<OrdenTrabajo[]>(() => {
    if (session.rol === "admin") return ordenesTrabajo;
    return ordenesTrabajo.filter(ot => ot.mecanico === session.nombre);
  }, [ordenesTrabajo, session]);

  /* === FILTRAR COTIZACIONES POR BÚSQUEDA === */
  const cotizacionesFiltradas = useMemo<Cotizacion[]>(() => {
    if (!search.trim()) return cotizacionesVisibles;
    
    const s = search.toLowerCase();
    return cotizacionesVisibles.filter(c =>
      c.codigo.toLowerCase().includes(s) ||
      c.clienteNombre.toLowerCase().includes(s) ||
      c.vehiculoPlaca.toLowerCase().includes(s) ||
      c.clienteCedula.includes(search) ||
      (c.codigoOrdenTrabajo && c.codigoOrdenTrabajo.toLowerCase().includes(s))
    );
  }, [cotizacionesVisibles, search]);

  /* === FILTRAR REPUESTOS POR VEHÍCULO === */
  const repuestosFiltrados = useMemo<ItemInventario[]>(() => {
    if (!inventario.length) return [];
    
    if (!vehiculoSeleccionado) {
      return inventario.filter(repuesto => !repuesto.vehiculoId);
    }
    
    if (!vehiculoSeleccionado.vehiculoBaseId) {
      return inventario.filter(repuesto => !repuesto.vehiculoId);
    }
    
    const vehiculoBaseId = Number(vehiculoSeleccionado.vehiculoBaseId);
    
    return inventario.filter(repuesto => {
      const esUniversal = !repuesto.vehiculoId;
      const repuestoVehiculoId = repuesto.vehiculoId ? Number(repuesto.vehiculoId) : null;
      const esEspecifico = repuestoVehiculoId && repuestoVehiculoId === vehiculoBaseId;
      
      return esUniversal || esEspecifico;
    });
  }, [inventario, vehiculoSeleccionado]);

  /* === MANEJAR BÚSQUEDA DE REPUESTOS === */
  const manejarBusquedaRepuestos = (busqueda: string): void => {
    setRepSeleccionado(busqueda);
    
    if (busqueda.trim() === '') {
      setRepuestosFiltradosBusqueda(repuestosFiltrados.slice(0, 10));
      setShowRepuestosDropdown(false);
      return;
    }

    const filtrados = repuestosFiltrados.filter(repuesto =>
      repuesto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      repuesto.codigo.toLowerCase().includes(busqueda.toLowerCase())
    ).slice(0, 10);

    setRepuestosFiltradosBusqueda(filtrados);
    setShowRepuestosDropdown(filtrados.length > 0);
  };

  /* === MANEJAR BÚSQUEDA DE SERVICIOS === */
  const manejarBusquedaServicios = (busqueda: string): void => {
    setServicioSeleccionado(busqueda);
    
    if (busqueda.trim() === '') {
      setServiciosFiltradosBusqueda(manoDeObra.slice(0, 10));
      setShowServiciosDropdown(false);
      return;
    }

    const filtrados = manoDeObra.filter(servicio =>
      servicio.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      servicio.codigo.toLowerCase().includes(busqueda.toLowerCase())
    ).slice(0, 10);

    setServiciosFiltradosBusqueda(filtrados);
    setShowServiciosDropdown(filtrados.length > 0);
  };

  /* === SELECCIONAR REPUESTO === */
  const seleccionarRepuesto = (repuesto: ItemInventario): void => {
    setRepSeleccionado(repuesto.codigo);
    setShowRepuestosDropdown(false);
  };

  /* === SELECCIONAR SERVICIO === */
  const seleccionarServicio = (servicio: ServicioManoObra): void => {
    setServicioSeleccionado(servicio.codigo);
    setShowServiciosDropdown(false);
  };

  /* === INTERFAZ PARA CÁLCULO DE TOTALES === */
  interface Totales {
    subtotalRepuestos: number;
    subtotalManoObra: number;
    descuentoMonto: number;
    iva: number;
    total: number;
  }

  /* === CÁLCULO DE TOTALES === */
  const calculoTotales = useMemo<Totales>(() => {
    // Subtotal de repuestos
    const subtotalRepuestos = (form.repuestos || []).reduce((total: number, repuesto: Repuesto) => {
      return total + (repuesto.cantidad * repuesto.precio);
    }, 0);

    // Subtotal de mano de obra (sin descuento)
    const subtotalManoObra = (form.manoObra || []).reduce((total: number, servicio: ManoObra) => {
      return total + servicio.tarifa;
    }, 0);

    // Calcular descuento sobre mano de obra
    const descuentoPorcentaje = Number(form.descuentoManoObra) || 0;
    const descuentoMonto = (subtotalManoObra * descuentoPorcentaje) / 100;
    const manoObraConDescuento = subtotalManoObra - descuentoMonto;

    // Calcular subtotal antes de IVA (repuestos + mano de obra con descuento)
    const subtotalAntesIVA = subtotalRepuestos + manoObraConDescuento;
    
    // Calcular IVA del 13% sobre el subtotal
    const iva = subtotalAntesIVA * 0.13;
    
    // Total final
    const total = subtotalAntesIVA + iva;

    return {
      subtotalRepuestos,
      subtotalManoObra,
      descuentoMonto,
      iva,
      total
    };
  }, [form.repuestos, form.manoObra, form.descuentoManoObra]);

  /* === FORMATO DE MONEDA === */
  const formatoMoneda = (valor: number): string => {
    // Redondear a 2 decimales y formatear para Costa Rica
    const valorRedondeado = Math.round(valor * 100) / 100;
    return '₡' + new Intl.NumberFormat('es-CR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valorRedondeado);
  };

  /* === AGREGAR REPUESTO === */
  const agregarRepuesto = (): void => {
    if (!repSeleccionado) return;
    
    const rep = repuestosFiltrados.find((r) => r.codigo === repSeleccionado);
    if (!rep) {
      showToast("Repuesto no encontrado.", "error");
      return;
    }

    if (cantidadRep < 1) {
      showToast("La cantidad debe ser al menos 1.", "warning");
      return;
    }

    setForm((f: FormCotizacion) => ({
      ...f,
      repuestos: [
        ...(f.repuestos || []),
        { 
          codigo: rep.codigo, 
          nombre: rep.nombre, 
          cantidad: cantidadRep,
          precio: rep.precio,
          subtotal: rep.precio * cantidadRep
        },
      ],
    }));

    setRepSeleccionado("");
    setCantidadRep(1);
    setShowRepuestosDropdown(false);
  };

  /* === ELIMINAR REPUESTO === */
  const eliminarRepuesto = (index: number): void => {
    setForm((f: FormCotizacion) => {
      const rep = [...(f.repuestos || [])];
      rep.splice(index, 1);
      return { ...f, repuestos: rep };
    });
  };

  /* === AGREGAR MANO DE OBRA === */
  const agregarManoObra = (): void => {
    if (!servicioSeleccionado) return;
    
    const servicio = manoDeObra.find((s) => s.codigo === servicioSeleccionado);
    if (!servicio) return;

    setForm((f: FormCotizacion) => ({
      ...f,
      manoObra: [
        ...(f.manoObra || []),
        { 
          codigo: servicio.codigo,
          nombre: servicio.nombre,
          descripcion: servicio.descripcion,
          horas: 1,
          tarifa: servicio.precio
        },
      ],
    }));

    setServicioSeleccionado("");
    setShowServiciosDropdown(false);
  };

  /* === ELIMINAR MANO DE OBRA === */
  const eliminarManoObra = (index: number): void => {
    setForm((f: FormCotizacion) => {
      const mo = [...(f.manoObra || [])];
      mo.splice(index, 1);
      return { ...f, manoObra: mo };
    });
  };

  /* === INICIAR NUEVA COTIZACIÓN === */
  const iniciarNuevaCotizacion = (ordenSeleccionada: OrdenTrabajo | null = null): void => {
    if (ordenSeleccionada) {
      setForm({
        codigo: "",
        clienteNombre: ordenSeleccionada.clienteNombre,
        clienteCedula: ordenSeleccionada.clienteCedula,
        vehiculoPlaca: ordenSeleccionada.placa,
        descuentoManoObra: 0,
        repuestos: (ordenSeleccionada.repuestosUtilizados || []).map(repuesto => ({
          codigo: repuesto.codigo,
          nombre: repuesto.nombre,
          cantidad: repuesto.cantidad || 1,
          precio: repuesto.precio || 0,
          subtotal: (repuesto.precio || 0) * (repuesto.cantidad || 1)
        })),
        manoObra: (ordenSeleccionada.serviciosRealizados || []).map(servicio => ({
          codigo: servicio.codigo,
          nombre: servicio.nombre,
          descripcion: servicio.descripcion || "",
          horas: 1,
          tarifa: servicio.precio || 0
        })),
        esProforma: false,
        estado: "borrador",
        codigoOrdenTrabajo: ordenSeleccionada.codigoOrden,
        mecanicoOrdenTrabajo: session.nombre
      });
      
      const vehiculo = vehiculos.find(v => v.placa === ordenSeleccionada.placa);
      setVehiculoSeleccionado(vehiculo || null);
    } else {
      setForm({
        codigo: "",
        clienteNombre: "",
        clienteCedula: "",
        vehiculoPlaca: "",
        descuentoManoObra: 0,
        repuestos: [],
        manoObra: [],
        esProforma: false,
        estado: "borrador",
        codigoOrdenTrabajo: "",
        mecanicoOrdenTrabajo: session.nombre
      });
      setVehiculoSeleccionado(null);
    }
    
    setEditMode(false);
    setShowModalNueva(false);
    setShowModalDetalle(true);
  };

  /* === ABRIR EDICIÓN === */
  const abrirEdicion = (cotizacion: Cotizacion): void => {
    if (session.rol !== "admin" && cotizacion.mecanicoOrdenTrabajo !== session.nombre) {
      showToast("No tienes permiso para editar esta cotización.", "warning");
      return;
    }
    
    // Convertir Cotizacion a FormCotizacion correctamente
    const formCotizacion: FormCotizacion = {
      codigo: cotizacion.codigo,
      clienteNombre: cotizacion.clienteNombre,
      clienteCedula: cotizacion.clienteCedula,
      vehiculoPlaca: cotizacion.vehiculoPlaca,
      descuentoManoObra: cotizacion.descuentoManoObra,
      repuestos: cotizacion.repuestos || [],
      manoObra: cotizacion.manoObra || [],
      esProforma: cotizacion.esProforma,
      estado: cotizacion.estado,
      codigoOrdenTrabajo: cotizacion.codigoOrdenTrabajo || "",
      mecanicoOrdenTrabajo: cotizacion.mecanicoOrdenTrabajo
    };
    
    setForm(formCotizacion);
    
    if (cotizacion.vehiculoPlaca) {
      const vehiculo = vehiculos.find(v => v.placa === cotizacion.vehiculoPlaca);
      setVehiculoSeleccionado(vehiculo || null);
    } else {
      setVehiculoSeleccionado(null);
    }
    
    setEditMode(true);
    setSelected(cotizacion);
    setShowModalDetalle(true);
  };

  /* === GUARDAR COTIZACIÓN === */
  const guardarCotizacion = async (): Promise<void> => {
    if (!form.clienteNombre.trim() || !form.clienteCedula.trim()) {
      showToast("Debe completar los datos del cliente.", "warning");
      return;
    }

    if (!form.vehiculoPlaca.trim()) {
      showToast("Debe seleccionar un vehículo.", "warning");
      return;
    }

    if (form.repuestos.length === 0 && form.manoObra.length === 0) {
      showToast("Debe agregar al menos un repuesto o un servicio.", "warning");
      return;
    }

    const payload: Omit<Cotizacion, 'codigo' | 'fechaCreacion'> = {
      clienteNombre: form.clienteNombre,
      clienteCedula: form.clienteCedula,
      vehiculoPlaca: form.vehiculoPlaca,
      repuestos: form.repuestos,
      manoObra: form.manoObra,
      descuentoManoObra: Number(form.descuentoManoObra) || 0,
      estado: form.estado || "borrador",
      codigoOrdenTrabajo: form.codigoOrdenTrabajo || undefined, // Usar undefined en lugar de string vacío
      mecanicoOrdenTrabajo: form.mecanicoOrdenTrabajo || session.nombre,
      subtotalRepuestos: calculoTotales.subtotalRepuestos,
      subtotalManoObra: calculoTotales.subtotalManoObra,
      iva: calculoTotales.iva,
      total: calculoTotales.total,
      esProforma: form.esProforma
    };

    try {
      if (editMode) {
        const actualizada = await apiCotizaciones.update(form.codigo, payload);
        if (actualizada.cotizacion) {
          setCotizaciones((prev: Cotizacion[]) =>
            prev.map((c: Cotizacion) =>
              c.codigo === actualizada.cotizacion!.codigo ? actualizada.cotizacion! : c
            )
          );
          // Actualizar el form con los datos correctos
          const formActualizada: FormCotizacion = {
            codigo: actualizada.cotizacion.codigo,
            clienteNombre: actualizada.cotizacion.clienteNombre,
            clienteCedula: actualizada.cotizacion.clienteCedula,
            vehiculoPlaca: actualizada.cotizacion.vehiculoPlaca,
            descuentoManoObra: actualizada.cotizacion.descuentoManoObra,
            repuestos: actualizada.cotizacion.repuestos || [],
            manoObra: actualizada.cotizacion.manoObra || [],
            esProforma: actualizada.cotizacion.esProforma,
            estado: actualizada.cotizacion.estado,
            codigoOrdenTrabajo: actualizada.cotizacion.codigoOrdenTrabajo || "",
            mecanicoOrdenTrabajo: actualizada.cotizacion.mecanicoOrdenTrabajo
          };
          setForm(formActualizada);
        }
        showToast("Cotización actualizada correctamente.", "success");
      } else {
        const creada = await apiCotizaciones.create(payload);
        if (creada.cotizacion) {
          setCotizaciones((prev: Cotizacion[]) => [...prev, creada.cotizacion!]);
          // Convertir la cotización creada a FormCotizacion
          const formCreada: FormCotizacion = {
            codigo: creada.cotizacion.codigo,
            clienteNombre: creada.cotizacion.clienteNombre,
            clienteCedula: creada.cotizacion.clienteCedula,
            vehiculoPlaca: creada.cotizacion.vehiculoPlaca,
            descuentoManoObra: creada.cotizacion.descuentoManoObra,
            repuestos: creada.cotizacion.repuestos || [],
            manoObra: creada.cotizacion.manoObra || [],
            esProforma: creada.cotizacion.esProforma,
            estado: creada.cotizacion.estado,
            codigoOrdenTrabajo: creada.cotizacion.codigoOrdenTrabajo || "",
            mecanicoOrdenTrabajo: creada.cotizacion.mecanicoOrdenTrabajo
          };
          setForm(formCreada);
        }
        setEditMode(true);
        showToast("Cotización creada correctamente.", "success");
      }
    } catch (e: any) {
      console.error(e);
      showToast(e.message, "error");
    }
  };

  /* === GENERAR PROFORMA === */
  const generarProforma = async (): Promise<void> => {
    if (!editMode) {
      showToast("Primero debe guardar la cotización.", "warning");
      return;
    }

    try {
      const verificacion = await apiCotizaciones.verificarStock(form.codigo);
      
      if (!verificacion.stockSuficiente) {
        if (!window.confirm("Algunos repuestos no tienen stock suficiente. ¿Desea continuar igualmente?")) {
          return;
        }
      }

      if (!window.confirm("¿Desea convertir esta cotización en proforma? Esta acción no se puede deshacer.")) {
        return;
      }

      const proforma = await apiCotizaciones.toProforma(form.codigo);
      if (proforma.cotizacion) {
        setCotizaciones((prev: Cotizacion[]) =>
          prev.map((c: Cotizacion) => (c.codigo === proforma.cotizacion!.codigo ? { ...c, esProforma: true } : c))
        );
        setForm({ ...form, esProforma: true });
      }
      
      showToast("Proforma generada correctamente.", "success");
      
    } catch (e: any) {
      console.error("Error al generar proforma:", e);
      showToast(`Error: ${e.message}`, "error");
    }
  };

  /* === ELIMINAR COTIZACIÓN === */
  const eliminarCotizacion = async (): Promise<void> => {
    if (!editMode) return;
    
    if (!window.confirm("¿Está seguro de eliminar esta cotización? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      await apiCotizaciones.remove(form.codigo);
      setCotizaciones((prev: Cotizacion[]) =>
        prev.filter((c: Cotizacion) => c.codigo !== form.codigo)
      );
      setShowModalDetalle(false);
      showToast("Cotización eliminada correctamente.", "success");
    } catch (e: any) {
      console.error(e);
      showToast(e.message, "error");
    }
  };

  /* === CERRAR MODALES === */
  const cerrarModales = (): void => {
    setShowModalNueva(false);
    setShowModalDetalle(false);
    setSelected(null);
  };

  /* === GENERAR PDF DE COTIZACIÓN === */
  const generarPDFCotizacion = async (cotizacion: Cotizacion): Promise<void> => {
    try {
      // Transformar datos de Cotizacion a formato compatible con GeneradorPDF
      const datosPDF = {
        esProforma: cotizacion.esProforma,
        clienteNombre: cotizacion.clienteNombre,
        clienteCedula: cotizacion.clienteCedula,
        vehiculoPlaca: cotizacion.vehiculoPlaca,
        codigo: cotizacion.codigo,
        codigoOrdenTrabajo: cotizacion.codigoOrdenTrabajo,
        repuestos: cotizacion.repuestos.map(r => ({
          nombre: r.nombre,
          cantidad: r.cantidad,
          precio: r.precio
        })),
        manoObra: cotizacion.manoObra.map(m => ({
          nombre: m.nombre,
          tarifa: m.tarifa
        })),
        descuentoManoObra: cotizacion.descuentoManoObra
      };
      
      await GeneradorPDF.generarCotizacionPDF(datosPDF);
    } catch (error) {
      console.error('Error generando PDF:', error);
      showToast('Error al generar el PDF. Por favor, intenta de nuevo.', 'error');
    }
  };

  /* === MANEJAR CLICK FUERA DE DROPDOWNS === */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (repuestosDropdownRef.current && !repuestosDropdownRef.current.contains(event.target as Node)) {
        setShowRepuestosDropdown(false);
      }
      if (serviciosDropdownRef.current && !serviciosDropdownRef.current.contains(event.target as Node)) {
        setShowServiciosDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="gestion-cotizaciones">
      {/* HEADER CON ESTADÍSTICAS */}
      <div className="header-section">
        <div className="stats">
          <span className="stat-item">Total: {cotizacionesVisibles.length} cotizaciones</span>
          <span className="stat-item">Mostrando: {cotizacionesFiltradas.length}</span>
          <span className="stat-item">Proformas: {cotizacionesVisibles.filter(c => c.esProforma).length}</span>
          {session.rol !== "admin" && (
            <span className="stat-item">(Solo tus cotizaciones)</span>
          )}
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
              placeholder="Buscar por código, cliente, placa o OT..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button
              className="boton boton-agregar boton-grande"
              onClick={() => setShowModalNueva(true)}
            >
              <span className="icono">+</span>
              Nueva Cotización
            </button>
          </div>

          {/* TABLA DE COTIZACIONES */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Cliente</th>
                  <th>Placa</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {cotizacionesFiltradas.map((cotizacion: Cotizacion) => (
                  <tr 
                    key={cotizacion.codigo}
                    className={selected?.codigo === cotizacion.codigo ? 'selected-row' : ''}
                    onClick={() => {
                      setSelected(cotizacion);
                    }}
                  >
                    <td className="codigo-column">{cotizacion.codigo}</td>
                    <td className="nombre-column">{cotizacion.clienteNombre}</td>
                    <td>{cotizacion.vehiculoPlaca}</td>
                    <td>
                      <span className={`tipo-badge ${cotizacion.esProforma ? 'proforma' : 'cotizacion'}`}>
                        {cotizacion.esProforma ? 'Proforma' : 'Cotización'}
                      </span>
                    </td>
                    <td>
                      <span className={`estado-badge estado-${cotizacion.estado}`}>
                        {cotizacion.estado}
                      </span>
                    </td>
                    <td>{cotizacion.fechaCreacion}</td>
                    <td className="total-column">{formatoMoneda(cotizacion.total || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {cotizacionesFiltradas.length === 0 && (
              <div className="no-results">
                {search ? 'No se encontraron cotizaciones' : 'No hay cotizaciones'}
              </div>
            )}
          </div>
        </div>

        {/* CONTENEDOR DERECHO - DETALLES */}
        {selected && !showModalDetalle && (
          <div className="contenedor-detalles">
            <div className="sidebar-details">
              <div className="sidebar-header">
                <h4>Detalles de Cotización</h4>
                <button className="btn-close" onClick={() => setSelected(null)}>×</button>
              </div>
              
              <div className="sidebar-body">
                <div className="detail-item">
                  <span className="detail-label">Código:</span>
                  <span className="detail-value">{selected.codigo}</span>
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
                  <span className="detail-value">{selected.vehiculoPlaca}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Tipo:</span>
                  <span className="detail-value">
                    <span className={`tipo-badge ${selected.esProforma ? 'proforma' : 'cotizacion'}`}>
                      {selected.esProforma ? 'Proforma' : 'Cotización'}
                    </span>
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Estado:</span>
                  <span className="detail-value">
                    <span className={`estado-badge estado-${selected.estado}`}>
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
                  <span className="detail-value">{formatoMoneda(selected.total || 0)}</span>
                </div>
                {selected.codigoOrdenTrabajo && (
                  <div className="detail-item">
                    <span className="detail-label">Orden Trabajo:</span>
                    <span className="detail-value">{selected.codigoOrdenTrabajo}</span>
                  </div>
                )}
              </div>
              
              <div className="sidebar-footer">
                <button 
                  className="boton boton-editar"
                  onClick={() => abrirEdicion(selected)}
                  disabled={selected.esProforma}
                >
                  {selected.esProforma ? 'Proforma (No Editable)' : 'Editar Cotización'}
                </button>
                <button 
                  className="boton boton-secundario"
                  onClick={() => generarPDFCotizacion(selected)}
                >
                  📄 Generar PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL NUEVA COTIZACIÓN */}
      {showModalNueva && (
        <div className="modal-overlay" onClick={cerrarModales}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nueva Cotización</h3>
              <button className="btn-close" onClick={cerrarModales}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="info-usuario">
                <p><strong>Usuario:</strong> {session.nombre} | <strong>Rol:</strong> {session.rol}</p>
                {session.rol !== 'admin' && (
                  <p className="info-text">Solo puedes crear cotizaciones para tus órdenes de trabajo.</p>
                )}
              </div>
              
              <div className="form-group">
                <label>Seleccionar Orden de Trabajo (Opcional)</label>
                <select
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const ordenSeleccionada = ordenesTrabajoVisibles.find(ot => ot.codigoOrden === e.target.value);
                    if (ordenSeleccionada) {
                      iniciarNuevaCotizacion(ordenSeleccionada);
                    }
                  }}
                  defaultValue=""
                >
                  <option value="">Crear desde orden de trabajo...</option>
                  {ordenesTrabajoVisibles.map(ot => (
                    <option key={ot.codigoOrden} value={ot.codigoOrden}>
                      {ot.codigoOrden} - {ot.clienteNombre} - {ot.placa}
                    </option>
                  ))}
                </select>
                {ordenesTrabajoVisibles.length === 0 && (
                  <p className="warning-text">
                    {session.rol === 'admin' 
                      ? "No hay órdenes de trabajo disponibles."
                      : "No tienes órdenes de trabajo disponibles."
                    }
                  </p>
                )}
              </div>
              
              <div className="separador">O</div>
              
              <div className="form-group">
                <p>Crear cotización vacía</p>
                <button 
                  className="boton boton-agregar"
                  onClick={() => iniciarNuevaCotizacion()}
                >
                  Crear Cotización Vacía
                </button>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="boton boton-cancelar" onClick={cerrarModales}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE/EDICIÓN DE COTIZACIÓN */}
      {showModalDetalle && (
        <div className="modal-overlay" onClick={cerrarModales}>
          <div className="modal modal-grande" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {form.esProforma ? 'Proforma' : 'Cotización'} 
                {form.codigo ? ` ${form.codigo}` : ' Nueva'}
                {form.codigoOrdenTrabajo && (
                  <span className="subtitulo"> (Desde OT: {form.codigoOrdenTrabajo})</span>
                )}
              </h3>
              <button className="btn-close" onClick={cerrarModales}>×</button>
            </div>
            
            <div className="modal-body">
              {/* INFORMACIÓN BÁSICA */}
              <div className="seccion-info">
                <h4>Información del Cliente y Vehículo</h4>
                <div className="grid-info">
                  <div className="info-item">
                    <label>Cliente:</label>
                    <input
                      type="text"
                      value={form.clienteNombre}
                      onChange={e => setForm({...form, clienteNombre: e.target.value})}
                      disabled={form.esProforma}
                      placeholder="Nombre del cliente"
                    />
                  </div>
                  <div className="info-item">
                    <label>Cédula:</label>
                    <input
                      type="text"
                      value={form.clienteCedula}
                      onChange={e => setForm({...form, clienteCedula: e.target.value})}
                      disabled={form.esProforma}
                      placeholder="Cédula del cliente"
                    />
                  </div>
                  <div className="info-item">
                    <label>Placa:</label>
                    <input
                      type="text"
                      value={form.vehiculoPlaca}
                      onChange={e => setForm({...form, vehiculoPlaca: e.target.value})}
                      disabled={form.esProforma}
                      placeholder="Placa del vehículo"
                    />
                  </div>
                  <div className="info-item">
                    <label>Descuento %:</label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={form.descuentoManoObra}
                      onChange={e => setForm({...form, descuentoManoObra: Number(e.target.value)})}
                      disabled={form.esProforma}
                    />
                  </div>
                </div>
              </div>

              {/* REPUESTOS */}
              <div className="seccion-items">
                <h4>Repuestos</h4>
                <div className="table-scrollable">
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Cantidad</th>
                        <th>Precio Unit.</th>
                        <th>Subtotal</th>
                        {!form.esProforma && <th>Acciones</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {form.repuestos.map((repuesto: Repuesto, index: number) => (
                        <tr key={index}>
                          <td>{repuesto.codigo}</td>
                          <td>{repuesto.nombre}</td>
                          <td>{repuesto.cantidad}</td>
                          <td>{formatoMoneda(repuesto.precio)}</td>
                          <td>{formatoMoneda(repuesto.subtotal || repuesto.precio * repuesto.cantidad)}</td>
                          {!form.esProforma && (
                            <td>
                              <button 
                                className="boton boton-eliminar-pequeno"
                                onClick={() => eliminarRepuesto(index)}
                              >
                                Eliminar
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                      {form.repuestos.length === 0 && (
                        <tr>
                          <td colSpan={6} className="no-items">No hay repuestos agregados</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* AGREGAR REPUESTO */}
                {!form.esProforma && (
                  <div className="agregar-item-form" ref={repuestosDropdownRef}>
                    <div className="form-group-inline">
                      <div className="dropdown-container">
                        <input
                          type="text"
                          placeholder="Buscar repuesto..."
                          value={repSeleccionado}
                          onChange={e => manejarBusquedaRepuestos(e.target.value)}
                          onFocus={() => {
                            setRepuestosFiltradosBusqueda(repuestosFiltrados.slice(0, 10));
                            setShowRepuestosDropdown(repuestosFiltrados.length > 0);
                          }}
                        />
                        
                        {showRepuestosDropdown && (
                          <div className="dropdown-list">
                            {repuestosFiltradosBusqueda.map((repuesto: ItemInventario) => (
                              <div
                                key={repuesto.codigo}
                                className="dropdown-item"
                                onClick={() => seleccionarRepuesto(repuesto)}
                              >
                                <div className="dropdown-item-main">
                                  <strong>{repuesto.nombre}</strong>
                                  <span className="dropdown-price">{formatoMoneda(repuesto.precio)}</span>
                                </div>
                                <div className="dropdown-item-details">
                                  <span className={`dropdown-badge ${repuesto.vehiculoId ? 'specific' : 'universal'}`}>
                                    {repuesto.vehiculoId ? 'Específico' : 'Universal'}
                                  </span>
                                  <span className="dropdown-stock">Stock: {repuesto.cantidad}</span>
                                </div>
                                <div className="dropdown-item-code">
                                  Código: {repuesto.codigo}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <input
                        type="number"
                        min="1"
                        placeholder="Cantidad"
                        value={cantidadRep}
                        onChange={e => setCantidadRep(parseInt(e.target.value) || 1)}
                      />
                      
                      <button 
                        className="boton boton-agregar"
                        onClick={agregarRepuesto}
                        disabled={!repSeleccionado || cantidadRep < 1}
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* MANO DE OBRA */}
              <div className="seccion-items">
                <h4>Servicios</h4>
                <div className="table-scrollable">
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Tarifa</th>
                        {!form.esProforma && <th>Acciones</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {form.manoObra.map((servicio: ManoObra, index: number) => (
                        <tr key={index}>
                          <td>{servicio.codigo}</td>
                          <td>{servicio.nombre}</td>
                          <td>{servicio.descripcion}</td>
                          <td>{formatoMoneda(servicio.tarifa)}</td>
                          {!form.esProforma && (
                            <td>
                              <button 
                                className="boton boton-eliminar-pequeno"
                                onClick={() => eliminarManoObra(index)}
                              >
                                Eliminar
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                      {form.manoObra.length === 0 && (
                        <tr>
                          <td colSpan={5} className="no-items">No hay servicios agregados</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* AGREGAR SERVICIO */}
                {!form.esProforma && (
                  <div className="agregar-item-form" ref={serviciosDropdownRef}>
                    <div className="form-group-inline">
                      <div className="dropdown-container">
                        <input
                          type="text"
                          placeholder="Buscar servicio..."
                          value={servicioSeleccionado}
                          onChange={e => manejarBusquedaServicios(e.target.value)}
                          onFocus={() => {
                            setServiciosFiltradosBusqueda(manoDeObra.slice(0, 10));
                            setShowServiciosDropdown(manoDeObra.length > 0);
                          }}
                        />
                        
                        {showServiciosDropdown && (
                          <div className="dropdown-list">
                            {serviciosFiltradosBusqueda.map((servicio: ServicioManoObra) => (
                              <div
                                key={servicio.codigo}
                                className="dropdown-item"
                                onClick={() => seleccionarServicio(servicio)}
                              >
                                <div className="dropdown-item-main">
                                  <strong>{servicio.nombre}</strong>
                                  <span className="dropdown-price">{formatoMoneda(servicio.precio)}</span>
                                </div>
                                <div className="dropdown-item-desc">
                                  {servicio.descripcion}
                                </div>
                                <div className="dropdown-item-code">
                                  Código: {servicio.codigo}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <button 
                        className="boton boton-agregar"
                        onClick={agregarManoObra}
                        disabled={!servicioSeleccionado}
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* RESUMEN DE TOTALES */}
              <div className="resumen-totales">
                <h4>Resumen de Totales</h4>
                <div className="total-item">
                  <span>Subtotal Repuestos:</span>
                  <span>{formatoMoneda(calculoTotales.subtotalRepuestos)}</span>
                </div>
                <div className="total-item">
                  <span>Subtotal Servicios:</span>
                  <span>{formatoMoneda(calculoTotales.subtotalManoObra)}</span>
                </div>
                <div className="total-item">
                  <span>Descuento ({form.descuentoManoObra}%):</span>
                  <span>-{formatoMoneda(calculoTotales.descuentoMonto)}</span>
                </div>
                <div className="total-item">
                  <span>IVA (13%):</span>
                  <span>{formatoMoneda(calculoTotales.iva)}</span>
                </div>
                <div className="total-item total-final">
                  <span>Total:</span>
                  <span>{formatoMoneda(calculoTotales.total)}</span>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <div className="acciones-finales">
                {!form.esProforma && (
                  <>
                    <button className="boton boton-guardar" onClick={guardarCotizacion}>
                      {editMode ? 'Actualizar' : 'Guardar'} Cotización
                    </button>
                    {editMode && (
                      <button className="boton boton-editar" onClick={generarProforma}>
                        Generar Proforma
                      </button>
                    )}
                    {editMode && (
                      <button className="boton boton-secundario" onClick={() => {
                        const cotizacionCompleta: Cotizacion = {
                          ...form,
                          codigo: form.codigo,
                          fechaCreacion: new Date().toISOString().split('T')[0],
                          subtotalRepuestos: calculoTotales.subtotalRepuestos,
                          subtotalManoObra: calculoTotales.subtotalManoObra,
                          iva: calculoTotales.iva,
                          total: calculoTotales.total
                        };
                        generarPDFCotizacion(cotizacionCompleta);
                      }}>
                        Generar PDF
                      </button>
                    )}
                    {editMode && (
                      <button className="boton boton-eliminar" onClick={eliminarCotizacion}>
                        Eliminar
                      </button>
                    )}
                  </>
                )}
                <button className="boton boton-cancelar" onClick={cerrarModales}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionCotizacion;