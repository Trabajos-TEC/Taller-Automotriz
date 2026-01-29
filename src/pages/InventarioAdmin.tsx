// src/pages/InventarioAdmin.tsx - VERSIÓN CORREGIDA CON ESTADOS SEPARADOS
import React, { useState, useEffect, useCallback } from 'react';
import { vehiculoBaseService } from '../services/vehiculo_base.service';
import { inventarioService } from '../services/inventario.service';
import type { VehiculoBase as VehiculoBaseServicio } from '../services/vehiculo_base.service';
import type { Producto } from '../services/inventario.service';
import '../styles/pages/Inventario.css';
import '../styles/Botones.css';

// Interfaces locales
interface VehiculoBase {
  id: number;
  marca: string;
  modelo: string;
  tipo: string;
  anio: number;
}

interface Repuesto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  cantidad: number;
  precio: number;
  vehiculoId: number | null;
}

interface RepuestoForm extends Omit<Repuesto, 'id'> {
  proveedor: string;
  cantidad_minima: number;
  precio_compra: number;
  categoria: string;
}

const InventarioAdmin: React.FC = () => {
  // Estados para vehículos base
  const [vehiculos, setVehiculos] = useState<VehiculoBase[]>([]);
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  
  // Estados para búsqueda y selección
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Repuesto | null>(null);
  const [showModalAgregar, setShowModalAgregar] = useState(false);
  const [showModalAgregarVehiculo, setShowModalAgregarVehiculo] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [vehiculosExpandidos, setVehiculosExpandidos] = useState<number[]>([]);
  
  // Estados para carga y errores
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingVehiculos, setLoadingVehiculos] = useState(false);

  // Estado para nuevo repuesto
  const [newRepuesto, setNewRepuesto] = useState<RepuestoForm>({ 
    codigo: '', 
    nombre: '', 
    descripcion: '', 
    cantidad: 0,
    precio: 0,
    vehiculoId: null,
    proveedor: 'N/A',
    cantidad_minima: 5,
    precio_compra: 0,
    categoria: 'Repuesto'
  });

  // Estado para editar repuesto (SEPARADO)
  const [editRepuesto, setEditRepuesto] = useState<RepuestoForm>({ 
    codigo: '', 
    nombre: '', 
    descripcion: '', 
    cantidad: 0,
    precio: 0,
    vehiculoId: null,
    proveedor: 'N/A',
    cantidad_minima: 5,
    precio_compra: 0,
    categoria: 'Repuesto'
  });

  // Estado para nuevo vehículo
  const [newVehiculo, setNewVehiculo] = useState<Omit<VehiculoBase, 'id'>>({
    marca: '',
    modelo: '',
    tipo: '',
    anio: new Date().getFullYear()
  });

  // Estados para mensajes de error
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Estados para manejar inputs con datalist (AGREGAR)
  const [vehiculoInputValue, setVehiculoInputValue] = useState('');
  const [categoriaInputValue, setCategoriaInputValue] = useState('Repuesto');
  const [tipoInputValue, setTipoInputValue] = useState('');

  // Estados para manejar inputs con datalist (EDITAR) - SEPARADOS
  const [editVehiculoInputValue, setEditVehiculoInputValue] = useState('');
  const [editCategoriaInputValue, setEditCategoriaInputValue] = useState('Repuesto');

  // Función para obtener el texto del vehículo seleccionado
  const getVehiculoTexto = useCallback((vehiculoId: number | null) => {
    if (!vehiculoId) return '';
    const vehiculo = vehiculos.find(v => v.id === vehiculoId);
    return vehiculo ? `${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.tipo})` : '';
  }, [vehiculos]);

  // Función para transformar vehículo del servicio a local
  const transformarVehiculo = (vehiculo: VehiculoBaseServicio): VehiculoBase => ({
    id: vehiculo.id || 0,
    marca: vehiculo.marca || '',
    modelo: vehiculo.modelo || '',
    tipo: vehiculo.tipo || '',
    anio: vehiculo.anio || new Date().getFullYear()
  });

  // Función para transformar producto del servicio a repuesto local
  const transformarProducto = (producto: Producto): Repuesto => {
    try {
      let vehiculoId: number | null = null;
      
      if (producto.vehiculos_asociados && producto.vehiculos_asociados.length > 0) {
        const primerVehiculo = producto.vehiculos_asociados[0];
        if (primerVehiculo && primerVehiculo.id !== undefined) {
          vehiculoId = Number(primerVehiculo.id);
        }
      }
      
      return {
        id: Number(producto.id) || 0,
        codigo: String(producto.codigo || ''),
        nombre: String(producto.nombre || ''),
        descripcion: String(producto.descripcion || ''),
        cantidad: Number(producto.cantidad) || 0,
        precio: Number(producto.precio_venta) || 0,
        vehiculoId: vehiculoId
      };
    } catch (error) {
      console.error('Error en transformarProducto:', error, 'Producto:', producto);
      return {
        id: 0,
        codigo: 'ERROR',
        nombre: 'Error de transformación',
        descripcion: '',
        cantidad: 0,
        precio: 0,
        vehiculoId: null
      };
    }
  };

  // Cargar vehículos base desde API
  const cargarVehiculosBase = useCallback(async (searchTerm?: string) => {
    try {
      setLoadingVehiculos(true);
      setError(null);
      
      const response = await vehiculoBaseService.getVehiculosBase(searchTerm);
      
      let vehiculosData: any[] = [];
      
      if (response && Array.isArray(response)) {
        vehiculosData = response;
      } else if (response && (response as any).data && Array.isArray((response as any).data)) {
        vehiculosData = (response as any).data;
      } else if (response && (response as any).success && Array.isArray((response as any).data)) {
        vehiculosData = (response as any).data;
      } else {
        console.error('Formato de respuesta de vehículos inesperado:', response);
        vehiculosData = [];
      }
      
      const vehiculosTransformados = vehiculosData.map(transformarVehiculo);
      setVehiculos(vehiculosTransformados);
      
    } catch (error: any) {
      console.error('Error cargando vehículos base:', error);
      setError('Error al cargar vehículos base: ' + (error.message || 'Error desconocido'));
      setVehiculos([]);
    } finally {
      setLoadingVehiculos(false);
    }
  }, []);

  // Cargar datos completos para edición
  const cargarDatosCompletosParaEdicion = useCallback(async (repuesto: Repuesto) => {
    try {
      const response = await inventarioService.getProductoByCodigo(repuesto.codigo);
      
      if (response && response.data) {
        const productoCompleto = response.data;
        
        // Actualizar editRepuesto con los datos completos
        setEditRepuesto({
          codigo: productoCompleto.codigo,
          nombre: productoCompleto.nombre,
          descripcion: productoCompleto.descripcion || '',
          cantidad: productoCompleto.cantidad,
          precio: productoCompleto.precio_venta,
          vehiculoId: repuesto.vehiculoId,
          proveedor: productoCompleto.proveedor || 'N/A',
          cantidad_minima: productoCompleto.cantidad_minima || 5,
          precio_compra: productoCompleto.precio_compra || 0,
          categoria: productoCompleto.categoria || 'Repuesto'
        });

        // Actualizar los inputs de edición
        setEditCategoriaInputValue(productoCompleto.categoria || 'Repuesto');
        setEditVehiculoInputValue(repuesto.vehiculoId ? getVehiculoTexto(repuesto.vehiculoId) : '');
      }
    } catch (error) {
      console.error('Error cargando datos completos del producto:', error);
    }
  }, [getVehiculoTexto]);

  // Cargar productos del inventario desde API
  const cargarProductos = useCallback(async (searchTerm?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await inventarioService.getProductos(searchTerm);
      
      let productosData: any[] = [];
      
      if (response && Array.isArray(response)) {
        productosData = response;
      } else if (response && (response as any).data && Array.isArray((response as any).data)) {
        productosData = (response as any).data;
      } else if (response && (response as any).success && Array.isArray((response as any).data)) {
        productosData = (response as any).data;
      } else if (response && typeof response === 'object') {
        const keys = Object.keys(response);
        for (const key of keys) {
          if (Array.isArray((response as any)[key])) {
            productosData = (response as any)[key];
            break;
          }
        }
      } else {
        console.error('Formato de respuesta inesperado:', response);
        productosData = [];
      }
      
      // Transformar productos
      const repuestosTransformados: Repuesto[] = [];
      
      for (let i = 0; i < productosData.length; i++) {
        try {
          const repuesto = transformarProducto(productosData[i]);
          repuestosTransformados.push(repuesto);
        } catch (error) {
          console.error(`Error transformando producto ${i}:`, error, 'Datos:', productosData[i]);
        }
      }
      
      setRepuestos(repuestosTransformados);
      
    } catch (error: any) {
      console.error('Error en cargarProductos:', error);
      setError('Error al cargar productos del inventario: ' + (error.message || 'Error desconocido'));
      setRepuestos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    cargarVehiculosBase();
    cargarProductos();
  }, [cargarVehiculosBase, cargarProductos]);

  // Búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim() !== '') {
        cargarVehiculosBase(search);
        cargarProductos(search);
      } else {
        cargarVehiculosBase();
        cargarProductos();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search, cargarVehiculosBase, cargarProductos]);

  // Efectos para inputs de AGREGAR
  useEffect(() => {
    if (newRepuesto.vehiculoId) {
      const texto = getVehiculoTexto(newRepuesto.vehiculoId);
      setVehiculoInputValue(texto);
    } else {
      setVehiculoInputValue('');
    }
  }, [newRepuesto.vehiculoId, getVehiculoTexto]);

  useEffect(() => {
    setCategoriaInputValue(newRepuesto.categoria);
  }, [newRepuesto.categoria]);

  useEffect(() => {
    setTipoInputValue(newVehiculo.tipo);
  }, [newVehiculo.tipo]);

  // Efectos para inputs de EDITAR
  useEffect(() => {
    if (editRepuesto.vehiculoId) {
      const texto = getVehiculoTexto(editRepuesto.vehiculoId);
      setEditVehiculoInputValue(texto);
    } else {
      setEditVehiculoInputValue('');
    }
  }, [editRepuesto.vehiculoId, getVehiculoTexto]);

  useEffect(() => {
    setEditCategoriaInputValue(editRepuesto.categoria);
  }, [editRepuesto.categoria]);

  // Función para agregar nuevo vehículo base
  const agregarVehiculo = async () => {
    try {
      // Validaciones
      const validationErrors: { [key: string]: string } = {};
      
      if (!newVehiculo.marca.trim()) {
        validationErrors.marca = 'La marca es requerida';
      }
      
      if (!newVehiculo.modelo.trim()) {
        validationErrors.modelo = 'El modelo es requerido';
      }
      
      if (newVehiculo.anio < 1900 || newVehiculo.anio > new Date().getFullYear() + 1) {
        validationErrors.anio = 'Año inválido';
      }
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      
      setLoadingVehiculos(true);
      setErrors({});
      
      const vehiculoData = {
        marca: newVehiculo.marca.trim(),
        modelo: newVehiculo.modelo.trim(),
        tipo: newVehiculo.tipo.trim(),
        anio: newVehiculo.anio
      };
      
      const response = await vehiculoBaseService.createVehiculoBase(vehiculoData);
      
      if (response) {
        setNewVehiculo({
          marca: '',
          modelo: '',
          tipo: '',
          anio: new Date().getFullYear()
        });
        
        setShowModalAgregarVehiculo(false);
        alert('Vehículo creado exitosamente');
        
        await cargarVehiculosBase();
      }
    } catch (error: any) {
      console.error('Error agregando vehículo:', error);
      setError('Error al crear vehículo: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoadingVehiculos(false);
    }
  };

  // Función para agregar nuevo repuesto
  const agregarRepuesto = async () => {
    try {
      // Validaciones
      const validationErrors: { [key: string]: string } = {};
      
      if (!newRepuesto.codigo.trim()) {
        validationErrors.codigo = 'El código es requerido';
      }
      
      if (!newRepuesto.nombre.trim()) {
        validationErrors.nombre = 'El nombre es requerido';
      }
      
      if (newRepuesto.cantidad < 0) {
        validationErrors.cantidad = 'La cantidad no puede ser negativa';
      }
      
      if (newRepuesto.precio <= 0) {
        validationErrors.precio = 'El precio de venta debe ser mayor a 0';
      }
      
      if (newRepuesto.precio_compra <= 0) {
        validationErrors.precio_compra = 'El precio de compra debe ser mayor a 0';
      }
      
      if (newRepuesto.cantidad_minima < 0) {
        validationErrors.cantidad_minima = 'La cantidad mínima no puede ser negativa';
      }
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      
      setLoading(true);
      setErrors({});
      
      // Preparar datos según la interfaz Producto
      const productoData: Omit<Producto, 'id'> = {
        codigo: newRepuesto.codigo.toUpperCase(),
        nombre: newRepuesto.nombre.trim(),
        descripcion: newRepuesto.descripcion.trim() || '',
        categoria: newRepuesto.categoria,
        cantidad: newRepuesto.cantidad,
        cantidad_minima: newRepuesto.cantidad_minima,
        precio_compra: newRepuesto.precio_compra,
        precio_venta: newRepuesto.precio,
        proveedor: newRepuesto.proveedor.trim() || 'N/A',
      };
      
      const vehiculosIds = newRepuesto.vehiculoId ? [newRepuesto.vehiculoId] : [];
      
      const response = await inventarioService.createProducto(productoData, vehiculosIds);
      
      if (response) {
        // Resetear formulario
        setNewRepuesto({
          codigo: '',
          nombre: '',
          descripcion: '',
          cantidad: 0,
          precio: 0,
          vehiculoId: null,
          proveedor: 'N/A',
          cantidad_minima: 5,
          precio_compra: 0,
          categoria: 'Repuesto'
        });
        
        setVehiculoInputValue('');
        setCategoriaInputValue('Repuesto');
        
        setShowModalAgregar(false);
        alert('Repuesto agregado exitosamente');
        
        await cargarProductos();
      }
    } catch (error: any) {
      console.error('Error agregando repuesto:', error);
      
      if (error.message?.includes('código ya está registrado') || error.message?.includes('409')) {
        setErrors({ codigo: 'El código ya existe' });
      } else {
        setError('Error al agregar repuesto: ' + (error.message || 'Error desconocido'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para guardar edición de repuesto - ACTUALIZADA
  const guardarEdicion = async () => {
    if (!selected) return;
    
    try {
      // Validaciones
      const validationErrors: { [key: string]: string } = {};
      
      if (!editRepuesto.nombre.trim()) {
        validationErrors.nombre = 'El nombre es requerido';
      }
      
      if (editRepuesto.cantidad < 0) {
        validationErrors.cantidad = 'La cantidad no puede ser negativa';
      }
      
      if (editRepuesto.precio <= 0) {
        validationErrors.precio = 'El precio de venta debe ser mayor a 0';
      }
      
      if (editRepuesto.precio_compra <= 0) {
        validationErrors.precio_compra = 'El precio de compra debe ser mayor a 0';
      }
      
      if (editRepuesto.cantidad_minima < 0) {
        validationErrors.cantidad_minima = 'La cantidad mínima no puede ser negativa';
      }
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      
      setLoading(true);
      setErrors({});
      
      // Preparar datos para actualizar
      const updateData: Partial<Producto> = {
        nombre: editRepuesto.nombre.trim(),
        descripcion: editRepuesto.descripcion.trim() || '',
        cantidad: editRepuesto.cantidad,
        precio_venta: editRepuesto.precio,
        precio_compra: editRepuesto.precio_compra,
        cantidad_minima: editRepuesto.cantidad_minima,
        proveedor: editRepuesto.proveedor.trim() || 'N/A',
        categoria: editRepuesto.categoria
      };
      
      const vehiculosIds = editRepuesto.vehiculoId ? [editRepuesto.vehiculoId] : [];
      
      const response = await inventarioService.updateProducto(
        selected.codigo, 
        updateData, 
        vehiculosIds
      );
      
      if (response) {
        setShowModalEditar(false);
        alert('Repuesto actualizado exitosamente');
        
        await cargarProductos();
        await cargarVehiculosBase();
        
        // Resetear estados de edición
        setEditRepuesto({
          codigo: '',
          nombre: '',
          descripcion: '',
          cantidad: 0,
          precio: 0,
          vehiculoId: null,
          proveedor: 'N/A',
          cantidad_minima: 5,
          precio_compra: 0,
          categoria: 'Repuesto'
        });
        setEditVehiculoInputValue('');
        setEditCategoriaInputValue('Repuesto');
        
        // Deseleccionar
        setSelected(null);
      }
    } catch (error: any) {
      console.error('Error actualizando repuesto:', error);
      setError('Error al actualizar repuesto: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // FUNCIONES DE RENDERIZADO
  const renderRepuestos = () => {
    try {
      if (repuestos.length === 0) {
        return (
          <div className="no-results">
            {search ? 'No se encontraron resultados' : 'No hay repuestos en inventario'}
          </div>
        );
      }

      const textoBusqueda = search.toLowerCase();

      const repuestosUniversales = repuestos.filter(
        (r) => !r.vehiculoId && (
          r.codigo.toLowerCase().includes(textoBusqueda) ||
          r.nombre.toLowerCase().includes(textoBusqueda) ||
          r.descripcion.toLowerCase().includes(textoBusqueda)
        )
      );

      const vehiculosFiltrados = vehiculos.filter((v) => {
        const nombreVehiculo = `${v.marca} ${v.modelo} ${v.tipo}`.toLowerCase();
        const repuestosDelVehiculo = repuestos.filter((r) => r.vehiculoId === v.id);
        const repuestosCoinciden = repuestosDelVehiculo.some((r) =>
          r.codigo.toLowerCase().includes(textoBusqueda) ||
          r.nombre.toLowerCase().includes(textoBusqueda) ||
          r.descripcion.toLowerCase().includes(textoBusqueda)
        );

        return nombreVehiculo.includes(textoBusqueda) || repuestosCoinciden;
      });

      const repuestosPorVehiculo = (vehiculoId: number) => {
        const vehiculo = vehiculos.find(v => v.id === vehiculoId);
        const nombreVehiculo = vehiculo ? `${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.tipo}`.toLowerCase() : '';
        const todosRepuestos = repuestos.filter((r) => r.vehiculoId === vehiculoId);

        if (nombreVehiculo.includes(textoBusqueda)) return todosRepuestos;

        return todosRepuestos.filter((r) =>
          r.codigo.toLowerCase().includes(textoBusqueda) ||
          r.nombre.toLowerCase().includes(textoBusqueda) ||
          r.descripcion.toLowerCase().includes(textoBusqueda)
        );
      };

      const noHayRepuestos = repuestosUniversales.length === 0 && vehiculosFiltrados.length === 0;

      if (noHayRepuestos) {
        return (
          <div className="no-results">
            {search ? 'No se encontraron resultados' : 'No hay repuestos en inventario'}
          </div>
        );
      }

      return (
        <>
          {/* REPUESTOS UNIVERSALES */}
          {repuestosUniversales.length > 0 && (
            <div className="categoria-repuestos">
              <div className="categoria-header">
                <h4> Repuestos Universales</h4>
                <span className="contador">{repuestosUniversales.length}</span>
              </div>
              <div className="repuestos-lista">
                {repuestosUniversales.map((repuesto) => (
                  <div 
                    key={repuesto.id}
                    className={`repuesto-item ${selected?.id === repuesto.id ? 'selected' : ''}`}
                    onClick={() => setSelected(repuesto)}
                  >
                    <div className="repuesto-info">
                      <span className="repuesto-codigo">{repuesto.codigo}</span>
                      <span className="repuesto-nombre">{repuesto.nombre}</span>
                    </div>
                    <div className="repuesto-stats">
                      <span className={`cantidad ${repuesto.cantidad < 10 ? 'baja' : ''}`}>
                        {repuesto.cantidad} uni
                      </span>
                      <span className="precio">₡{repuesto.precio.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VEHÍCULOS */}
          {vehiculosFiltrados.length > 0 && (
            <div className="categoria-vehiculos">
              <div className="categoria-header">
                <h4> Vehículos Específicos</h4>
                <span className="contador">{vehiculosFiltrados.length}</span>
              </div>
              {vehiculosFiltrados.map((vehiculo) => {
                const repuestosVehiculo = repuestosPorVehiculo(vehiculo.id);
                const expandido = vehiculosExpandidos.includes(vehiculo.id);
                
                return (
                  <div key={vehiculo.id} className="vehiculo-item">
                    <div 
                      className="vehiculo-header"
                      onClick={() => setVehiculosExpandidos(prev => 
                        prev.includes(vehiculo.id) 
                          ? prev.filter(id => id !== vehiculo.id)
                          : [...prev, vehiculo.id]
                      )}
                    >
                      <div className="vehiculo-info">
                        <span className="icono-expandir">{expandido ? '▼' : '▶'}</span>
                        <span className="vehiculo-nombre">
                          {vehiculo.marca} {vehiculo.modelo} ({vehiculo.tipo})
                        </span>
                      </div>
                      <div className="vehiculo-stats">
                        <span className="contador-repuestos">{repuestosVehiculo.length} repuestos</span>
                      </div>
                    </div>
                    
                    {expandido && (
                      <div className="repuestos-vehiculo">
                        {repuestosVehiculo.length === 0 ? (
                          <div className="no-repuestos-vehiculo">
                            No hay repuestos para este vehículo
                          </div>
                        ) : (
                          repuestosVehiculo.map((repuesto) => (
                            <div 
                              key={repuesto.id}
                              className={`repuesto-item ${selected?.id === repuesto.id ? 'selected' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelected(repuesto);
                              }}
                            >
                              <div className="repuesto-info">
                                <span className="repuesto-codigo">{repuesto.codigo}</span>
                                <span className="repuesto-nombre">{repuesto.nombre}</span>
                              </div>
                              <div className="repuesto-stats">
                                <span className={`cantidad ${repuesto.cantidad < 10 ? 'baja' : ''}`}>
                                  {repuesto.cantidad} uni
                                </span>
                                <span className="precio">₡{repuesto.precio.toFixed(2)}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      );
    } catch (error) {
      console.error('❌ Error en renderRepuestos:', error);
      return (
        <div className="error-message">
          Error al mostrar repuestos: {error instanceof Error ? error.message : 'Error desconocido'}
        </div>
      );
    }
  };

  // Función para obtener nombre del vehículo
  const getNombreVehiculo = (vehiculoId: number | null) => {
    if (!vehiculoId) return 'Universal';
    const vehiculo = vehiculos.find(v => v.id === vehiculoId);
    return vehiculo ? `${vehiculo.marca} ${vehiculo.modelo}` : 'No asignado';
  };

  return (
    <div className="gestion-inventario">
      <div className="header-section">
        <div className="stats">
          <span className="stat-item">Total: {repuestos.length} repuestos</span>
          <span className="stat-item">Vehículos: {vehiculos.length}</span>
          <span className="stat-item">Mostrando: {search ? 'búsqueda...' : 'todos'}</span>
          {loading && <span className="stat-item">Cargando...</span>}
          {error && <span className="stat-item error">Error: {error}</span>}
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="contenedor-principal">
        {/* CONTENEDOR IZQUIERDO - LISTA JERÁRQUICA */}
        <div className="contenedor-lista">
          {/* BARRA DE BÚSQUEDA Y BOTONES */}
          <div className="busqueda-agregar">
            <input
              className="search-bar"
              placeholder="Buscar repuesto, vehículo o modelo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              disabled={loading || loadingVehiculos}
            />
            <button
              className="boton boton-agregar boton-grande"
              onClick={() => {
                setShowModalAgregarVehiculo(true);
                setErrors({});
              }}
              disabled={loading || loadingVehiculos}
            >
              <span className="icono">+</span>
              Agregar Vehículo
            </button>
            <button
              className="boton boton-agregar boton-grande"
              onClick={() => {
                setShowModalAgregar(true);
                setErrors({});
              }}
              disabled={loading || loadingVehiculos}
            >
              <span className="icono">+</span>
              Agregar Repuesto
            </button>
          </div>

          {/* LISTA JERÁRQUICA DE INVENTARIO */}
          <div className="table-container inventario-jerarquico">
            <div className="lista-inventario">
              {loading ? (
                <div className="loading">Cargando inventario...</div>
              ) : (
                renderRepuestos()
              )}
            </div>
          </div>
        </div>

        {/* CONTENEDOR DERECHO - DETALLES */}
        {selected && !showModalEditar && (
          <div className="contenedor-detalles">
            <div className="sidebar-details">
              <div className="sidebar-header">
                <h4>Detalles del Repuesto</h4>
                <button className="btn-close" onClick={() => setSelected(null)}>×</button>
              </div>
              
              <div className="sidebar-body">
                <div className="detail-item">
                  <span className="detail-label">Código:</span>
                  <span className="detail-value codigo-value">{selected.codigo}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Nombre:</span>
                  <span className="detail-value">{selected.nombre}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Descripción:</span>
                  <span className="detail-value">{selected.descripcion || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Cantidad:</span>
                  <span className={`detail-value ${selected.cantidad < 10 ? 'valor-bajo' : ''}`}>
                    {selected.cantidad} {selected.cantidad < 10 ? '⚠️' : ''}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Precio Unitario:</span>
                  <span className="detail-value">₡{selected.precio.toFixed(2)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Valor Total:</span>
                  <span className="detail-value">₡{(selected.cantidad * selected.precio).toFixed(2)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Vehículo:</span>
                  <span className="detail-value">{getNombreVehiculo(selected.vehiculoId)}</span>
                </div>
              </div>
              
              <div className="sidebar-footer">
                <button 
                  className="boton boton-editar"
                  onClick={async () => {
                    if (!selected) return;
                    
                    await cargarDatosCompletosParaEdicion(selected);
                    setShowModalEditar(true);
                    setErrors({});
                  }}
                  disabled={loading}
                >
                  Editar Repuesto
                </button>
                <button 
                  className="boton boton-eliminar"
                  onClick={async () => {
                    if (!confirm('¿Está seguro de eliminar este repuesto?')) return;
                    
                    try {
                      setLoading(true);
                      const response = await inventarioService.deleteProducto(selected.codigo);
                      
                      if (response) {
                        await cargarProductos();
                        setSelected(null);
                        alert('Repuesto eliminado exitosamente');
                      }
                    } catch (error: any) {
                      console.error('Error eliminando repuesto:', error);
                      alert('Error al eliminar repuesto: ' + (error.message || 'Error desconocido'));
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODALES */}
      {showModalAgregarVehiculo && (
        <div className="modal-overlay" onClick={() => !loadingVehiculos && setShowModalAgregarVehiculo(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agregar Vehículo Base</h3>
              <button 
                className="btn-close" 
                onClick={() => !loadingVehiculos && setShowModalAgregarVehiculo(false)}
                disabled={loadingVehiculos}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Marca *</label>
                <input
                  placeholder="Ej: Toyota, Honda, Ford"
                  value={newVehiculo.marca}
                  onChange={e => setNewVehiculo({ ...newVehiculo, marca: e.target.value })}
                  className={errors.marca ? 'input-error' : ''}
                  disabled={loadingVehiculos}
                />
                {errors.marca && <span className="error-message">{errors.marca}</span>}
              </div>
              
              <div className="form-group">
                <label>Modelo *</label>
                <input
                  placeholder="Ej: Corolla, Civic, Ranger"
                  value={newVehiculo.modelo}
                  onChange={e => setNewVehiculo({ ...newVehiculo, modelo: e.target.value })}
                  className={errors.modelo ? 'input-error' : ''}
                  disabled={loadingVehiculos}
                />
                {errors.modelo && <span className="error-message">{errors.modelo}</span>}
              </div>
              
              <div className="form-group">
                <label>Tipo *</label>
                <input
                  list="tipos-vehiculo-list"
                  placeholder="Escriba o seleccione tipo..."
                  value={tipoInputValue}
                  onChange={e => {
                    setTipoInputValue(e.target.value);
                    setNewVehiculo({ ...newVehiculo, tipo: e.target.value });
                  }}
                  className={errors.tipo ? 'input-error' : ''}
                  disabled={loadingVehiculos}
                />
                <datalist id="tipos-vehiculo-list">
                  <option value="Sedán">Sedán</option>
                  <option value="SUV">SUV</option>
                  <option value="Pickup">Pickup</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Coupé">Coupé</option>
                  <option value="Convertible">Convertible</option>
                  <option value="Minivan">Minivan</option>
                  <option value="Camioneta">Camioneta</option>
                  <option value="Deportivo">Deportivo</option>
                  <option value="Furgoneta">Furgoneta</option>
                  <option value="Motocicleta">Motocicleta</option>
                </datalist>
                {errors.tipo && <span className="error-message">El tipo es requerido</span>}
              </div>
              
              <div className="form-group">
                <label>Año</label>
                <input
                  type="number"
                  placeholder={`Ej: ${new Date().getFullYear()}`}
                  value={newVehiculo.anio}
                  onChange={e => setNewVehiculo({ ...newVehiculo, anio: parseInt(e.target.value) || new Date().getFullYear() })}
                  className={errors.anio ? 'input-error' : ''}
                  disabled={loadingVehiculos}
                />
                {errors.anio && <span className="error-message">{errors.anio}</span>}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="boton boton-guardar" 
                onClick={agregarVehiculo}
                disabled={loadingVehiculos}
              >
                {loadingVehiculos ? 'Guardando...' : 'Guardar Vehículo'}
              </button>
              <button 
                className="boton boton-cancelar" 
                onClick={() => !loadingVehiculos && setShowModalAgregarVehiculo(false)}
                disabled={loadingVehiculos}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR REPUESTO */}
      {showModalAgregar && (
        <div className="modal-overlay" onClick={() => !loading && setShowModalAgregar(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agregar Nuevo Repuesto</h3>
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
                <label>Código *</label>
                <input
                  placeholder="Ej: FIT001, PAS001"
                  value={newRepuesto.codigo}
                  onChange={e => setNewRepuesto({ ...newRepuesto, codigo: e.target.value.toUpperCase() })}
                  className={errors.codigo ? 'input-error' : ''}
                  disabled={loading}
                />
                {errors.codigo && <span className="error-message">{errors.codigo}</span>}
              </div>
              
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  placeholder="Ej: Filtro de Aceite, Pastillas de Freno"
                  value={newRepuesto.nombre}
                  onChange={e => setNewRepuesto({ ...newRepuesto, nombre: e.target.value })}
                  className={errors.nombre ? 'input-error' : ''}
                  disabled={loading}
                />
                {errors.nombre && <span className="error-message">{errors.nombre}</span>}
              </div>
              
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  placeholder="Descripción detallada del repuesto..."
                  value={newRepuesto.descripcion}
                  onChange={e => setNewRepuesto({ ...newRepuesto, descripcion: e.target.value })}
                  rows={3}
                  className="form-control"
                  disabled={loading}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group half-width">
                  <label>Cantidad *</label>
                  <input
                    type="number"
                    placeholder="Ej: 25"
                    value={newRepuesto.cantidad || ''}
                    onChange={e => setNewRepuesto({ ...newRepuesto, cantidad: parseInt(e.target.value) || 0 })}
                    className={errors.cantidad ? 'input-error' : ''}
                    disabled={loading}
                  />
                  {errors.cantidad && <span className="error-message">{errors.cantidad}</span>}
                </div>
                
                <div className="form-group half-width">
                  <label>Cantidad Mínima *</label>
                  <input
                    type="number"
                    placeholder="Ej: 5"
                    value={newRepuesto.cantidad_minima || ''}
                    onChange={e => setNewRepuesto({ ...newRepuesto, cantidad_minima: parseInt(e.target.value) || 5 })}
                    className={errors.cantidad_minima ? 'input-error' : ''}
                    disabled={loading}
                  />
                  {errors.cantidad_minima && <span className="error-message">{errors.cantidad_minima}</span>}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group half-width">
                  <label>Precio de Compra *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ej: 10000.00"
                    value={newRepuesto.precio_compra || ''}
                    onChange={e => setNewRepuesto({ ...newRepuesto, precio_compra: parseFloat(e.target.value) || 0 })}
                    className={errors.precio_compra ? 'input-error' : ''}
                    disabled={loading}
                  />
                  {errors.precio_compra && <span className="error-message">{errors.precio_compra}</span>}
                </div>
                
                <div className="form-group half-width">
                  <label>Precio de Venta *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ej: 15000.00"
                    value={newRepuesto.precio || ''}
                    onChange={e => setNewRepuesto({ ...newRepuesto, precio: parseFloat(e.target.value) || 0 })}
                    className={errors.precio ? 'input-error' : ''}
                    disabled={loading}
                  />
                  {errors.precio && <span className="error-message">{errors.precio}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label>Categoría</label>
                <input
                  list="categorias-list"
                  placeholder="Escriba o seleccione categoría..."
                  value={categoriaInputValue}
                  onChange={e => {
                    setCategoriaInputValue(e.target.value);
                    setNewRepuesto({ ...newRepuesto, categoria: e.target.value });
                  }}
                  className="select-con-busqueda-input"
                  disabled={loading}
                />
                <datalist id="categorias-list">
                  <option value="Repuesto">Repuesto</option>
                  <option value="Accesorio">Accesorio</option>
                  <option value="Herramienta">Herramienta</option>
                  <option value="Lubricante">Lubricante</option>
                  <option value="Consumible">Consumible</option>
                  <option value="Electrónico">Electrónico</option>
                  <option value="Iluminación">Iluminación</option>
                  <option value="Carrocería">Carrocería</option>
                  <option value="Motor">Motor</option>
                  <option value="Transmisión">Transmisión</option>
                </datalist>
              </div>
              
              <div className="form-group">
                <label>Proveedor</label>
                <input
                  placeholder="Ej: Distribuidora XYZ, Proveedor ABC"
                  value={newRepuesto.proveedor}
                  onChange={e => setNewRepuesto({ ...newRepuesto, proveedor: e.target.value })}
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>Asignar a Vehículo (opcional)</label>
                <input
                  list="vehiculos-list"
                  placeholder="Escriba o seleccione vehículo..."
                  value={vehiculoInputValue}
                  onChange={e => {
                    const value = e.target.value;
                    setVehiculoInputValue(value);
                    
                    // Buscar si el texto coincide con algún vehículo
                    const vehiculoSeleccionado = vehiculos.find(v => 
                      `${v.marca} ${v.modelo} (${v.tipo})` === value
                    );
                    
                    if (vehiculoSeleccionado) {
                      setNewRepuesto({ ...newRepuesto, vehiculoId: vehiculoSeleccionado.id });
                    } else {
                      // Si el input está vacío, establecer como null
                      if (value.trim() === '') {
                        setNewRepuesto({ ...newRepuesto, vehiculoId: null });
                      }
                    }
                  }}
                  className="select-con-busqueda-input"
                  disabled={loading}
                />
                <datalist id="vehiculos-list">
                  <option value="">Repuesto Universal</option>
                  {vehiculos.map(vehiculo => (
                    <option key={vehiculo.id} value={`${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.tipo})`}>
                      {vehiculo.marca} {vehiculo.modelo} ({vehiculo.tipo})
                    </option>
                  ))}
                </datalist>
                <small className="field-info">Dejar vacío para repuesto universal</small>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="boton boton-guardar" 
                onClick={agregarRepuesto}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar Repuesto'}
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

      {/* MODAL EDITAR REPUESTO - CON ESTADOS SEPARADOS */}
      {showModalEditar && selected && (
        <div className="modal-overlay" onClick={() => !loading && setShowModalEditar(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Repuesto</h3>
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
                <label>Código</label>
                <input
                  value={selected.codigo}
                  disabled
                  className="input-disabled"
                />
                <small className="field-info">El código no se puede modificar</small>
              </div>
              
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  placeholder="Ej: Filtro de Aceite, Pastillas de Freno"
                  value={editRepuesto.nombre}
                  onChange={e => setEditRepuesto({ ...editRepuesto, nombre: e.target.value })}
                  className={errors.nombre ? 'input-error' : ''}
                  disabled={loading}
                />
                {errors.nombre && <span className="error-message">{errors.nombre}</span>}
              </div>
              
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  placeholder="Descripción detallada del repuesto..."
                  value={editRepuesto.descripcion}
                  onChange={e => setEditRepuesto({ ...editRepuesto, descripcion: e.target.value })}
                  rows={3}
                  className="form-control"
                  disabled={loading}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group half-width">
                  <label>Cantidad *</label>
                  <input
                    type="number"
                    placeholder="Ej: 25"
                    value={editRepuesto.cantidad || ''}
                    onChange={e => setEditRepuesto({ ...editRepuesto, cantidad: parseInt(e.target.value) || 0 })}
                    className={errors.cantidad ? 'input-error' : ''}
                    disabled={loading}
                  />
                  {errors.cantidad && <span className="error-message">{errors.cantidad}</span>}
                </div>
                
                <div className="form-group half-width">
                  <label>Cantidad Mínima *</label>
                  <input
                    type="number"
                    placeholder="Ej: 5"
                    value={editRepuesto.cantidad_minima || ''}
                    onChange={e => setEditRepuesto({ ...editRepuesto, cantidad_minima: parseInt(e.target.value) || 5 })}
                    className={errors.cantidad_minima ? 'input-error' : ''}
                    disabled={loading}
                  />
                  {errors.cantidad_minima && <span className="error-message">{errors.cantidad_minima}</span>}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group half-width">
                  <label>Precio de Compra *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ej: 10000.00"
                    value={editRepuesto.precio_compra || ''}
                    onChange={e => setEditRepuesto({ ...editRepuesto, precio_compra: parseFloat(e.target.value) || 0 })}
                    className={errors.precio_compra ? 'input-error' : ''}
                    disabled={loading}
                  />
                  {errors.precio_compra && <span className="error-message">{errors.precio_compra}</span>}
                </div>
                
                <div className="form-group half-width">
                  <label>Precio de Venta *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ej: 15000.00"
                    value={editRepuesto.precio || ''}
                    onChange={e => setEditRepuesto({ ...editRepuesto, precio: parseFloat(e.target.value) || 0 })}
                    className={errors.precio ? 'input-error' : ''}
                    disabled={loading}
                  />
                  {errors.precio && <span className="error-message">{errors.precio}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label>Categoría</label>
                <input
                  list="categorias-list-edit"
                  placeholder="Escriba o seleccione categoría..."
                  value={editCategoriaInputValue}
                  onChange={e => {
                    setEditCategoriaInputValue(e.target.value);
                    setEditRepuesto({ ...editRepuesto, categoria: e.target.value });
                  }}
                  className="select-con-busqueda-input"
                  disabled={loading}
                />
                <datalist id="categorias-list-edit">
                  <option value="Repuesto">Repuesto</option>
                  <option value="Accesorio">Accesorio</option>
                  <option value="Herramienta">Herramienta</option>
                  <option value="Lubricante">Lubricante</option>
                  <option value="Consumible">Consumible</option>
                  <option value="Electrónico">Electrónico</option>
                  <option value="Iluminación">Iluminación</option>
                  <option value="Carrocería">Carrocería</option>
                  <option value="Motor">Motor</option>
                  <option value="Transmisión">Transmisión</option>
                </datalist>
              </div>
              
              <div className="form-group">
                <label>Proveedor</label>
                <input
                  placeholder="Ej: Distribuidora XYZ, Proveedor ABC"
                  value={editRepuesto.proveedor}
                  onChange={e => setEditRepuesto({ ...editRepuesto, proveedor: e.target.value })}
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>Asignar a Vehículo (opcional)</label>
                <input
                  list="vehiculos-list-edit"
                  placeholder="Escriba o seleccione vehículo..."
                  value={editVehiculoInputValue}
                  onChange={e => {
                    const value = e.target.value;
                    setEditVehiculoInputValue(value);
                    
                    // Buscar si el texto coincide con algún vehículo
                    const vehiculoSeleccionado = vehiculos.find(v => 
                      `${v.marca} ${v.modelo} (${v.tipo})` === value
                    );
                    
                    if (vehiculoSeleccionado) {
                      setEditRepuesto({ ...editRepuesto, vehiculoId: vehiculoSeleccionado.id });
                    } else {
                      // Si el input está vacío, establecer como null
                      if (value.trim() === '') {
                        setEditRepuesto({ ...editRepuesto, vehiculoId: null });
                      }
                    }
                  }}
                  className="select-con-busqueda-input"
                  disabled={loading}
                />
                <datalist id="vehiculos-list-edit">
                  <option value="">Repuesto Universal</option>
                  {vehiculos.map(vehiculo => (
                    <option key={vehiculo.id} value={`${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.tipo})`}>
                      {vehiculo.marca} {vehiculo.modelo} ({vehiculo.tipo})
                    </option>
                  ))}
                </datalist>
                <small className="field-info">Dejar vacío para repuesto universal</small>
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

export default InventarioAdmin;