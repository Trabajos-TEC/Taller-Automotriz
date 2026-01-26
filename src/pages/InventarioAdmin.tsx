// src/pages/InventarioAdmin.tsx
import React, { useState, useEffect } from 'react';
import '../styles/pages/Inventario.css';

interface Repuesto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  cantidad: number;
  precio: number;
  vehiculoId: number | null;
}

interface VehiculoBase {
  id: number;
  marca: string;
  modelo: string;
  tipo: string;
  anio: number;
}

const InventarioAdmin: React.FC = () => {
  // Estado para vehículos base
  const [vehiculos, setVehiculos] = useState<VehiculoBase[]>([
    { id: 1, marca: 'Toyota', modelo: 'Corolla', tipo: 'Sedán', anio: 2020 },
    { id: 2, marca: 'Honda', modelo: 'Civic', tipo: 'Sedán', anio: 2019 },
    { id: 3, marca: 'Ford', modelo: 'Ranger', tipo: 'Pickup', anio: 2021 },
    { id: 4, marca: 'Chevrolet', modelo: 'Spark', tipo: 'Hatchback', anio: 2018 },
    { id: 5, marca: 'Nissan', modelo: 'Sentra', tipo: 'Sedán', anio: 2022 },
    { id: 6, marca: 'Mitsubishi', modelo: 'Montero', tipo: 'SUV', anio: 2017 },
    { id: 7, marca: 'Hyundai', modelo: 'Tucson', tipo: 'SUV', anio: 2020 },
    { id: 8, marca: 'Kia', modelo: 'Rio', tipo: 'Sedán', anio: 2019 },
  ]);

  // Estado para la lista de repuestos
  const [repuestos, setRepuestos] = useState<Repuesto[]>([
    { id: 1, codigo: 'FIT001', nombre: 'Filtro de Aceite', descripcion: 'Filtro de aceite estándar', cantidad: 25, precio: 15.99, vehiculoId: 1 },
    { id: 2, codigo: 'PAS001', nombre: 'Pastillas de Freno', descripcion: 'Pastillas delanteras', cantidad: 18, precio: 45.50, vehiculoId: 1 },
    { id: 3, codigo: 'BAT001', nombre: 'Batería 12V', descripcion: 'Batería de 60 amperios', cantidad: 12, precio: 120.00, vehiculoId: 2 },
    { id: 4, codigo: 'ACE001', nombre: 'Aceite 5W-30', descripcion: 'Aceite sintético 1L', cantidad: 50, precio: 8.99, vehiculoId: null },
    { id: 5, codigo: 'FIL002', nombre: 'Filtro de Aire', descripcion: 'Filtro de aire de alto flujo', cantidad: 30, precio: 22.50, vehiculoId: 3 },
    { id: 6, codigo: 'BUJ001', nombre: 'Bujías NGK', descripcion: 'Bujías de platino', cantidad: 40, precio: 12.75, vehiculoId: null },
    { id: 7, codigo: 'COR001', nombre: 'Correa de Distribución', descripcion: 'Kit completo', cantidad: 8, precio: 85.00, vehiculoId: 2 },
    { id: 8, codigo: 'DIS001', nombre: 'Disco de Freno', descripcion: 'Disco ventilado', cantidad: 15, precio: 65.00, vehiculoId: 4 },
    { id: 9, codigo: 'AMO001', nombre: 'Amortiguador Delantero', descripcion: 'Par de amortiguadores', cantidad: 6, precio: 95.00, vehiculoId: 5 },
    { id: 10, codigo: 'RAD001', nombre: 'Líquido Refrigerante', descripcion: 'Anticongelante concentrado', cantidad: 35, precio: 10.25, vehiculoId: null },
    { id: 11, codigo: 'BOM001', nombre: 'Bomba de Agua', descripcion: 'Bomba de agua original', cantidad: 7, precio: 75.00, vehiculoId: 6 },
    { id: 12, codigo: 'EMB001', nombre: 'Embrague', descripcion: 'Kit de embrague completo', cantidad: 4, precio: 220.00, vehiculoId: 7 },
    { id: 13, codigo: 'ALT001', nombre: 'Alternador', descripcion: 'Alternador 120A', cantidad: 5, precio: 180.00, vehiculoId: 8 },
    { id: 14, codigo: 'DIR001', nombre: 'Líquido de Dirección', descripcion: 'ATF para dirección', cantidad: 20, precio: 7.50, vehiculoId: null },
    { id: 15, codigo: 'ESC001', nombre: 'Escobillas Limpiaparabrisas', descripcion: 'Par de escobillas', cantidad: 60, precio: 18.99, vehiculoId: null },
  ]);

  // Estados para búsqueda y selección
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Repuesto | null>(null);
  const [showModalAgregar, setShowModalAgregar] = useState(false);
  const [showModalAgregarVehiculo, setShowModalAgregarVehiculo] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  
  // Estados para vehículos expandidos
  const [vehiculosExpandidos, setVehiculosExpandidos] = useState<number[]>([]);

  // Estado para nuevo repuesto
  const [newRepuesto, setNewRepuesto] = useState<Repuesto>({ 
    id: 0,
    codigo: '', 
    nombre: '', 
    descripcion: '', 
    cantidad: 0,
    precio: 0,
    vehiculoId: null
  });

  // Estado para nuevo vehículo
  const [newVehiculo, setNewVehiculo] = useState<VehiculoBase>({
    id: 0,
    marca: '',
    modelo: '',
    tipo: '',
    anio: new Date().getFullYear()
  });

  // Estados para mensajes de error
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Tipos predefinidos
  const tiposVehiculo = ['Sedán', 'SUV', 'Pickup', 'Hatchback', 'Wagon', 'Camioneta', 'Deportivo', 'Motocicleta'];
  const marcasVehiculo = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Mitsubishi', 'Hyundai', 'Kia', 'Volkswagen', 'Mazda', 'Subaru', 'BMW', 'Mercedes', 'Audi', 'Volvo'];

  // Texto de búsqueda en minúsculas
  const textoBusqueda = search.toLowerCase();

  /* === FUNCIONES DE FILTRADO JERÁRQUICO === */

  // Repuestos universales que coinciden con la búsqueda
  const repuestosUniversales = repuestos.filter(
    (r) => !r.vehiculoId && (
      r.codigo.toLowerCase().includes(textoBusqueda) ||
      r.nombre.toLowerCase().includes(textoBusqueda) ||
      r.descripcion.toLowerCase().includes(textoBusqueda)
    )
  );

  // Vehículos filtrados por búsqueda de marca/modelo/tipo o repuestos que coincidan
  const vehiculosFiltrados = vehiculos.filter((v) => {
    const nombreVehiculo = `${v.marca} ${v.modelo} ${v.tipo}`.toLowerCase();

    // Todos los repuestos de este vehículo
    const repuestosDelVehiculo = repuestos.filter((r) => r.vehiculoId === v.id);

    // ¿Algún repuesto coincide con la búsqueda?
    const repuestosCoinciden = repuestosDelVehiculo.some((r) =>
      r.codigo.toLowerCase().includes(textoBusqueda) ||
      r.nombre.toLowerCase().includes(textoBusqueda) ||
      r.descripcion.toLowerCase().includes(textoBusqueda)
    );

    // Mostrar vehículo si: coincide la marca/modelo/tipo O algún repuesto coincide
    return nombreVehiculo.includes(textoBusqueda) || repuestosCoinciden;
  });

  // Función para obtener repuestos filtrados para un vehículo
  const repuestosPorVehiculo = (vehiculoId: number) => {
    const vehiculo = vehiculos.find(v => v.id === vehiculoId);
    const nombreVehiculo = vehiculo ? `${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.tipo}`.toLowerCase() : '';
    const todosRepuestos = repuestos.filter((r) => r.vehiculoId === vehiculoId);

    // Si el vehículo coincide con la búsqueda, mostramos todos sus repuestos
    if (nombreVehiculo.includes(textoBusqueda)) return todosRepuestos;

    // Si no, mostramos solo los repuestos que coincidan con la búsqueda
    return todosRepuestos.filter((r) =>
      r.codigo.toLowerCase().includes(textoBusqueda) ||
      r.nombre.toLowerCase().includes(textoBusqueda) ||
      r.descripcion.toLowerCase().includes(textoBusqueda)
    );
  };

  // Verificar si no hay repuestos para mostrar
  const noHayRepuestos = repuestosUniversales.length === 0 && vehiculosFiltrados.length === 0;

  // Calcular estadísticas
  const totalRepuestos = repuestos.length;
  const totalValor = repuestos.reduce((sum, r) => sum + (r.cantidad * r.precio), 0);
  const repuestosBajos = repuestos.filter(r => r.cantidad < 10).length;

  // Función para expandir/colapsar vehículo
  const toggleExpandirVehiculo = (vehiculoId: number) => {
    setVehiculosExpandidos(prev => 
      prev.includes(vehiculoId) 
        ? prev.filter(id => id !== vehiculoId)
        : [...prev, vehiculoId]
    );
  };

  // Expandir todos los vehículos cuando hay búsqueda
  useEffect(() => {
    if (search && vehiculosFiltrados.length > 0) {
      setVehiculosExpandidos(vehiculosFiltrados.map(v => v.id));
    }
  }, [search]);

  /* === VALIDACIONES === */
  const soloDecimales = /^\d+(\.\d{1,2})?$/;

  const validarRepuesto = (repuesto: Repuesto, isEdit: boolean = false) => {
    const newErrors: {[key: string]: string} = {};

    if (!repuesto.codigo.trim()) {
      newErrors.codigo = 'El código es obligatorio';
    } else if (!isEdit) {
      const existe = repuestos.find(r => r.codigo === repuesto.codigo.trim());
      if (existe) newErrors.codigo = 'Código ya registrado';
    }

    if (!repuesto.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (repuesto.cantidad < 0) {
      newErrors.cantidad = 'La cantidad no puede ser negativa';
    }

    if (repuesto.precio < 0) {
      newErrors.precio = 'El precio no puede ser negativo';
    } else if (!soloDecimales.test(repuesto.precio.toString())) {
      newErrors.precio = 'Formato de precio inválido';
    }

    return newErrors;
  };

  const validarVehiculo = (vehiculo: VehiculoBase) => {
    const newErrors: {[key: string]: string} = {};

    if (!vehiculo.marca.trim()) {
      newErrors.marca = 'La marca es obligatoria';
    }

    if (!vehiculo.modelo.trim()) {
      newErrors.modelo = 'El modelo es obligatorio';
    }

    if (vehiculo.anio < 1900 || vehiculo.anio > new Date().getFullYear() + 1) {
      newErrors.anio = 'Año inválido';
    }

    return newErrors;
  };

  /* === OPERACIONES CRUD === */
  const agregarRepuesto = () => {
    const validationErrors = validarRepuesto(newRepuesto);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const repuesto: Repuesto = {
      id: repuestos.length > 0 ? Math.max(...repuestos.map(r => r.id)) + 1 : 1,
      codigo: newRepuesto.codigo.trim().toUpperCase(),
      nombre: newRepuesto.nombre.trim(),
      descripcion: newRepuesto.descripcion.trim(),
      cantidad: newRepuesto.cantidad,
      precio: parseFloat(newRepuesto.precio.toFixed(2)),
      vehiculoId: newRepuesto.vehiculoId,
    };

    setRepuestos([...repuestos, repuesto]);
    setNewRepuesto({ id: 0, codigo: '', nombre: '', descripcion: '', cantidad: 0, precio: 0, vehiculoId: null });
    setErrors({});
    setShowModalAgregar(false);
    alert('Repuesto agregado exitosamente');
  };

  const agregarVehiculo = () => {
    const validationErrors = validarVehiculo(newVehiculo);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const vehiculo: VehiculoBase = {
      id: vehiculos.length > 0 ? Math.max(...vehiculos.map(v => v.id)) + 1 : 1,
      marca: newVehiculo.marca.trim(),
      modelo: newVehiculo.modelo.trim(),
      tipo: newVehiculo.tipo,
      anio: newVehiculo.anio
    };

    setVehiculos([...vehiculos, vehiculo]);
    setNewVehiculo({ id: 0, marca: '', modelo: '', tipo: '', anio: new Date().getFullYear() });
    setErrors({});
    setShowModalAgregarVehiculo(false);
    alert('Vehículo base agregado exitosamente');
  };

  const guardarEdicion = () => {
    if (!selected) return;

    const validationErrors = validarRepuesto(selected, true);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setRepuestos(repuestos.map(r => r.id === selected.id ? selected : r));
    setErrors({});
    setShowModalEditar(false);
    alert('Repuesto actualizado exitosamente');
  };

  const eliminarRepuesto = (id: number) => {
    if (!confirm('¿Está seguro de eliminar este repuesto?')) return;
    setRepuestos(repuestos.filter(r => r.id !== id));
    setSelected(null);
    alert('Repuesto eliminado');
  };

  const limpiarErrores = () => {
    setErrors({});
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
          <span className="stat-item">Total: {totalRepuestos} repuestos</span>
          <span className="stat-item">Valor: ${totalValor.toFixed(2)}</span>
          <span className="stat-item">Bajos: {repuestosBajos}</span>
          <span className="stat-item">Mostrando: {repuestosUniversales.length + vehiculosFiltrados.reduce((sum, v) => sum + repuestosPorVehiculo(v.id).length, 0)}</span>
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
            />
            <button
              className="boton boton-agregar boton-grande"
              onClick={() => {
                setShowModalAgregarVehiculo(true);
                limpiarErrores();
              }}
            >
              <span className="icono">+</span>
              Agregar Vehículo
            </button>
            <button
              className="boton boton-agregar boton-grande"
              onClick={() => {
                setShowModalAgregar(true);
                limpiarErrores();
              }}
            >
              <span className="icono">+</span>
              Agregar Repuesto
            </button>
          </div>

          {/* LISTA JERÁRQUICA DE INVENTARIO */}
          <div className="table-container inventario-jerarquico">
            <div className="lista-inventario">
              {noHayRepuestos ? (
                <div className="no-results">
                  {search ? 'No se encontraron resultados' : 'No hay repuestos en inventario'}
                </div>
              ) : (
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
                              onClick={() => toggleExpandirVehiculo(vehiculo.id)}
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
                    limpiarErrores();
                  }}
                >
                  Editar Repuesto
                </button>
                <button 
                  className="boton boton-eliminar"
                  onClick={() => eliminarRepuesto(selected.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL AGREGAR VEHÍCULO BASE - COMPLETO */}
      {showModalAgregarVehiculo && (
        <div className="modal-overlay" onClick={() => {
          setShowModalAgregarVehiculo(false);
          limpiarErrores();
        }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agregar Vehículo Base</h3>
              <button 
                className="btn-close" 
                onClick={() => setShowModalAgregarVehiculo(false)}
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
                >
                  <option value="">Seleccione una marca</option>
                  {marcasVehiculo.map(marca => (
                    <option key={marca} value={marca}>{marca}</option>
                  ))}
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
                />
                {errors.modelo && <span className="error-message">{errors.modelo}</span>}
              </div>
              
              <div className="form-group">
                <label>Tipo</label>
                <select
                  value={newVehiculo.tipo}
                  onChange={e => setNewVehiculo({ ...newVehiculo, tipo: e.target.value })}
                >
                  {tiposVehiculo.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
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
                />
                {errors.anio && <span className="error-message">{errors.anio}</span>}
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="boton boton-guardar" onClick={agregarVehiculo}>
                Guardar Vehículo
              </button>
              <button className="boton boton-cancelar" onClick={() => setShowModalAgregarVehiculo(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR REPUESTO - COMPLETO */}
      {showModalAgregar && (
        <div className="modal-overlay" onClick={() => {
          setShowModalAgregar(false);
          limpiarErrores();
        }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agregar Nuevo Repuesto</h3>
              <button 
                className="btn-close" 
                onClick={() => setShowModalAgregar(false)}
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
                  />
                  {errors.precio && <span className="error-message">{errors.precio}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label>Asignar a Vehículo (opcional)</label>
                <select
                  value={newRepuesto.vehiculoId || ''}
                  onChange={e => setNewRepuesto({ ...newRepuesto, vehiculoId: e.target.value ? parseInt(e.target.value) : null })}
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
              <button className="boton boton-guardar" onClick={agregarRepuesto}>
                Guardar Repuesto
              </button>
              <button className="boton boton-cancelar" onClick={() => setShowModalAgregar(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR REPUESTO - COMPLETO */}
      {showModalEditar && selected && (
        <div className="modal-overlay" onClick={() => {
          setShowModalEditar(false);
          limpiarErrores();
        }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Repuesto</h3>
              <button 
                className="btn-close" 
                onClick={() => setShowModalEditar(false)}
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
                  />
                  {errors.precio && <span className="error-message">{errors.precio}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label>Asignar a Vehículo</label>
                <select
                  value={selected.vehiculoId || ''}
                  onChange={e => setSelected({ ...selected, vehiculoId: e.target.value ? parseInt(e.target.value) : null })}
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
    </div>
  );
};

export default InventarioAdmin;