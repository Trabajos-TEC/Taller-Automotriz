// src/pages/InventarioAdmin.tsx - VERSIÓN CON MANEJO DE ERRORES
import React, { useState, useEffect, useCallback } from 'react';
import { vehiculoBaseService } from '../services/vehiculo_base.service';
import { inventarioService } from '../services/inventario.service';
import type { VehiculoBase as VehiculoBaseServicio } from '../services/vehiculo_base.service';
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
  const [newRepuesto, setNewRepuesto] = useState<Omit<Repuesto, 'id'>>({ 
    codigo: '', 
    nombre: '', 
    descripcion: '', 
    cantidad: 0,
    precio: 0,
    vehiculoId: null
  });

  // Estado para nuevo vehículo
  const [newVehiculo, setNewVehiculo] = useState<Omit<VehiculoBase, 'id'>>({
    marca: '',
    modelo: '',
    tipo: 'Sedán',
    anio: new Date().getFullYear()
  });

  // Estados para mensajes de error
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Estados para marcas y tipos disponibles desde API
  const [marcasDisponibles, setMarcasDisponibles] = useState<string[]>([]);
  const [tiposDisponibles, setTiposDisponibles] = useState<string[]>([]);

  // Función para transformar vehículo del servicio a local
  const transformarVehiculo = (vehiculo: VehiculoBaseServicio): VehiculoBase => ({
    id: vehiculo.id || 0,
    marca: vehiculo.marca || '',
    modelo: vehiculo.modelo || '',
    tipo: vehiculo.tipo || 'Sedán',
    anio: vehiculo.anio || new Date().getFullYear()
  });

  // Función para transformar producto del servicio a repuesto local - MEJORADA
  const transformarProducto = (producto: any): Repuesto => {
    try {
      // Asegurar que tenemos un objeto válido
      if (!producto || typeof producto !== 'object') {
        console.error('❌ Producto no es un objeto válido:', producto);
        return {
          id: 0,
          codigo: 'ERROR',
          nombre: 'Error en datos',
          descripcion: '',
          cantidad: 0,
          precio: 0,
          vehiculoId: null
        };
      }

      let vehiculoId: number | null = null;
      
      // Manejar vehiculos_asociados de forma segura
      if (producto.vehiculos_asociados !== undefined && producto.vehiculos_asociados !== null) {
        if (Array.isArray(producto.vehiculos_asociados) && producto.vehiculos_asociados.length > 0) {
          const primerVehiculo = producto.vehiculos_asociados[0];
          if (primerVehiculo && primerVehiculo.id !== undefined && primerVehiculo.id !== null) {
            // Convertir a número si es necesario
            vehiculoId = Number(primerVehiculo.id);
          }
        }
      }
      
      // Asegurar tipos correctos
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
      console.error('❌ Error en transformarProducto:', error, 'Producto:', producto);
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
      
      // MANEJO FLEXIBLE
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
      
      // Extraer marcas y tipos únicos
      const marcasUnicas = [...new Set(vehiculosTransformados.map(v => v.marca))].filter(Boolean);
      setMarcasDisponibles(marcasUnicas);
      
      const tiposUnicos = [...new Set(vehiculosTransformados.map(v => v.tipo))].filter(Boolean);
      setTiposDisponibles(tiposUnicos);
      
    } catch (error: any) {
      console.error('Error cargando vehículos base:', error);
      setError('Error al cargar vehículos base: ' + (error.message || 'Error desconocido'));
      setVehiculos([]);
    } finally {
      setLoadingVehiculos(false);
    }
  }, []);

  // Cargar productos del inventario desde API - CON CAPTURA DE ERRORES
  const cargarProductos = useCallback(async (searchTerm?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Cargando productos...');
      const response = await inventarioService.getProductos(searchTerm);
      console.log('📦 Respuesta recibida:', response);
      
      let productosData: any[] = [];
      
      if (response && Array.isArray(response)) {
        console.log('✅ Respuesta es array directo');
        productosData = response;
      } else if (response && (response as any).data && Array.isArray((response as any).data)) {
        console.log('✅ Respuesta tiene .data que es array');
        productosData = (response as any).data;
      } else if (response && (response as any).success && Array.isArray((response as any).data)) {
        console.log('✅ Respuesta tiene .success y .data que es array');
        productosData = (response as any).data;
      } else if (response && typeof response === 'object') {
        // Intentar cualquier propiedad que pueda contener datos
        console.log('⚠️ Respuesta inesperada, buscando datos...');
        const keys = Object.keys(response);
        console.log('🔑 Claves disponibles:', keys);
        
        for (const key of keys) {
          if (Array.isArray((response as any)[key])) {
            console.log(`✅ Encontrado array en propiedad: ${key}`);
            productosData = (response as any)[key];
            break;
          }
        }
      } else {
        console.error('❌ Formato de respuesta completamente inesperado:', response);
        productosData = [];
      }
      
      console.log(`📊 Productos a transformar: ${productosData.length}`);
      
      if (productosData.length > 0) {
        console.log('🔍 Ejemplo de producto sin transformar:', productosData[0]);
      }
      
      // Transformar con manejo de errores individuales
      const repuestosTransformados: Repuesto[] = [];
      
      for (let i = 0; i < productosData.length; i++) {
        try {
          const repuesto = transformarProducto(productosData[i]);
          repuestosTransformados.push(repuesto);
        } catch (error) {
          console.error(`❌ Error transformando producto ${i}:`, error, 'Datos:', productosData[i]);
          // Continuar con el siguiente producto
        }
      }
      
      console.log(`✅ Productos transformados exitosamente: ${repuestosTransformados.length}`);
      setRepuestos(repuestosTransformados);
      
    } catch (error: any) {
      console.error('❌ Error en cargarProductos:', error);
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
      
      // Datos para enviar
      const vehiculoData = {
        marca: newVehiculo.marca,
        modelo: newVehiculo.modelo,
        tipo: newVehiculo.tipo,
        anio: newVehiculo.anio
      };
      
      console.log('🚗 Enviando vehículo:', vehiculoData);
      
      const response = await vehiculoBaseService.createVehiculoBase(vehiculoData);
      
      if (response) {
        // Resetear formulario
        setNewVehiculo({
          marca: '',
          modelo: '',
          tipo: 'Sedán',
          anio: new Date().getFullYear()
        });
        
        setShowModalAgregarVehiculo(false);
        alert('Vehículo creado exitosamente');
        
        // Recargar lista de vehículos
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
        validationErrors.precio = 'El precio debe ser mayor a 0';
      }
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      
      setLoading(true);
      setErrors({});
      
      // Preparar datos para enviar según tu modelo
      const productoData = {
        codigo: newRepuesto.codigo.toUpperCase(),
        nombre: newRepuesto.nombre,
        descripcion: newRepuesto.descripcion,
        categoria: 'Repuesto', // Por defecto
        cantidad: newRepuesto.cantidad,
        cantidad_minima: 5, // Valor por defecto
        precio_compra: newRepuesto.precio, // Usamos el mismo precio para compra
        precio_venta: newRepuesto.precio,
        proveedor: 'N/A', // Por defecto
      };
      
      // Array de IDs de vehículos a asociar (si hay)
      const vehiculosIds = newRepuesto.vehiculoId ? [newRepuesto.vehiculoId] : [];
      
      console.log('📦 Enviando producto:', productoData);
      console.log('🚗 IDs de vehículos a asociar:', vehiculosIds);
      
      const response = await inventarioService.createProducto(productoData, vehiculosIds);
      
      if (response) {
        // Resetear formulario
        setNewRepuesto({
          codigo: '',
          nombre: '',
          descripcion: '',
          cantidad: 0,
          precio: 0,
          vehiculoId: null
        });
        
        setShowModalAgregar(false);
        alert('Repuesto agregado exitosamente');
        
        // Recargar lista de productos
        await cargarProductos();
      }
    } catch (error: any) {
      console.error('Error agregando repuesto:', error);
      
      // Manejar error de código duplicado
      if (error.message?.includes('código ya está registrado') || error.message?.includes('409')) {
        setErrors({ codigo: 'El código ya existe' });
      } else {
        setError('Error al agregar repuesto: ' + (error.message || 'Error desconocido'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para guardar edición de repuesto
  const guardarEdicion = async () => {
    if (!selected) return;
    
    try {
      // Validaciones
      const validationErrors: { [key: string]: string } = {};
      
      if (!selected.nombre.trim()) {
        validationErrors.nombre = 'El nombre es requerido';
      }
      
      if (selected.cantidad < 0) {
        validationErrors.cantidad = 'La cantidad no puede ser negativa';
      }
      
      if (selected.precio <= 0) {
        validationErrors.precio = 'El precio debe ser mayor a 0';
      }
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      
      setLoading(true);
      setErrors({});
      
      // Preparar datos para actualizar
      const updateData = {
        nombre: selected.nombre,
        descripcion: selected.descripcion,
        cantidad: selected.cantidad,
        precio_venta: selected.precio,
        precio_compra: selected.precio,
      };
      
      // Array de IDs de vehículos a asociar (si hay)
      const vehiculosIds = selected.vehiculoId ? [selected.vehiculoId] : [];
      
      console.log('✏️ Actualizando producto:', updateData);
      console.log('🚗 IDs de vehículos a asociar:', vehiculosIds);
      
      const response = await inventarioService.updateProducto(
        selected.codigo, 
        updateData, 
        vehiculosIds
      );
      
      if (response) {
        setShowModalEditar(false);
        alert('Repuesto actualizado exitosamente');
        
        // Recargar datos
        await cargarProductos();
        await cargarVehiculosBase();
        
        // Actualizar el selected con los nuevos datos
        const productos = await inventarioService.getProductos();
        if (productos && Array.isArray(productos.data)) {
          const productoActualizado = productos.data.find((p: any) => p.codigo === selected.codigo);
          if (productoActualizado) {
            setSelected(transformarProducto(productoActualizado));
          }
        }
      }
    } catch (error: any) {
      console.error('Error actualizando repuesto:', error);
      setError('Error al actualizar repuesto: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // FUNCIONES DE RENDERIZADO CON MANEJO DE ERRORES
  const renderRepuestos = () => {
    try {
      if (repuestos.length === 0) {
        return (
          <div className="no-results">
            {search ? 'No se encontraron resultados' : 'No hay repuestos en inventario'}
          </div>
        );
      }

      // Texto de búsqueda en minúsculas
      const textoBusqueda = search.toLowerCase();

      /* === FUNCIONES DE FILTRADO JERÁRQUICO === */
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
                      <span className="precio">${repuesto.precio.toFixed(2)}</span>
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
                                <span className="precio">${repuesto.precio.toFixed(2)}</span>
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
                  <span className="detail-value">${selected.precio.toFixed(2)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Valor Total:</span>
                  <span className="detail-value">${(selected.cantidad * selected.precio).toFixed(2)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Vehículo:</span>
                  <span className="detail-value">{getNombreVehiculo(selected.vehiculoId)}</span>
                </div>
              </div>
              
              <div className="sidebar-footer">
                <button 
                  className="boton boton-editar"
                  onClick={() => {
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
                <select
                  value={newVehiculo.marca}
                  onChange={e => setNewVehiculo({ ...newVehiculo, marca: e.target.value })}
                  className={errors.marca ? 'input-error' : ''}
                  disabled={loadingVehiculos}
                >
                  <option value="">Seleccione una marca</option>
                  {marcasDisponibles.length > 0 ? (
                    marcasDisponibles.map(marca => (
                      <option key={marca} value={marca}>{marca}</option>
                    ))
                  ) : (
                    <>
                      <option value="Toyota">Toyota</option>
                      <option value="Honda">Honda</option>
                      <option value="Ford">Ford</option>
                      <option value="Chevrolet">Chevrolet</option>
                    </>
                  )}
                </select>
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
                <label>Tipo</label>
                <select
                  value={newVehiculo.tipo}
                  onChange={e => setNewVehiculo({ ...newVehiculo, tipo: e.target.value })}
                  disabled={loadingVehiculos}
                >
                  <option value="">Seleccione tipo</option>
                  {tiposDisponibles.length > 0 ? (
                    tiposDisponibles.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))
                  ) : (
                    <>
                      <option value="Sedán">Sedán</option>
                      <option value="SUV">SUV</option>
                      <option value="Pickup">Pickup</option>
                      <option value="Hatchback">Hatchback</option>
                    </>
                  )}
                </select>
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
                  <label>Precio Unitario *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ej: 15.99"
                    value={newRepuesto.precio || ''}
                    onChange={e => setNewRepuesto({ ...newRepuesto, precio: parseFloat(e.target.value) || 0 })}
                    className={errors.precio ? 'input-error' : ''}
                    disabled={loading}
                  />
                  {errors.precio && <span className="error-message">{errors.precio}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label>Asignar a Vehículo (opcional)</label>
                <select
                  value={newRepuesto.vehiculoId || ''}
                  onChange={e => setNewRepuesto({ ...newRepuesto, vehiculoId: e.target.value ? parseInt(e.target.value) : null })}
                  disabled={loading}
                >
                  <option value="">Repuesto Universal</option>
                  {vehiculos.map(vehiculo => (
                    <option key={vehiculo.id} value={vehiculo.id}>
                      {vehiculo.marca} {vehiculo.modelo} ({vehiculo.tipo})
                    </option>
                  ))}
                </select>
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

      {/* MODAL EDITAR REPUESTO */}
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
                  placeholder="Ej: Filtro de Aceite"
                  value={selected.nombre}
                  onChange={e => setSelected({ ...selected, nombre: e.target.value })}
                  className={errors.nombre ? 'input-error' : ''}
                  disabled={loading}
                />
                {errors.nombre && <span className="error-message">{errors.nombre}</span>}
              </div>
              
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  placeholder="Descripción detallada del repuesto..."
                  value={selected.descripcion}
                  onChange={e => setSelected({ ...selected, descripcion: e.target.value })}
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
                    value={selected.cantidad || ''}
                    onChange={e => setSelected({ ...selected, cantidad: parseInt(e.target.value) || 0 })}
                    className={errors.cantidad ? 'input-error' : ''}
                    disabled={loading}
                  />
                  {errors.cantidad && <span className="error-message">{errors.cantidad}</span>}
                </div>
                
                <div className="form-group half-width">
                  <label>Precio Unitario *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ej: 15.99"
                    value={selected.precio || ''}
                    onChange={e => setSelected({ ...selected, precio: parseFloat(e.target.value) || 0 })}
                    className={errors.precio ? 'input-error' : ''}
                    disabled={loading}
                  />
                  {errors.precio && <span className="error-message">{errors.precio}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label>Asignar a Vehículo</label>
                <select
                  value={selected.vehiculoId || ''}
                  onChange={e => setSelected({ ...selected, vehiculoId: e.target.value ? parseInt(e.target.value) : null })}
                  disabled={loading}
                >
                  <option value="">Repuesto Universal</option>
                  {vehiculos.map(vehiculo => (
                    <option key={vehiculo.id} value={vehiculo.id}>
                      {vehiculo.marca} {vehiculo.modelo} ({vehiculo.tipo})
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

export default InventarioAdmin;