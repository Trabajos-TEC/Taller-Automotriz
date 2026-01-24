// src/pages/Vehiculos.tsx
import React, { useState } from 'react';
import '../styles/pages/Vehiculos.css';

interface Vehiculo {
  placa: string;
  marca: string;
  modelo: string;
  anio: string;
  tipo: string;
  clienteCedula: string;
  clienteNombre: string;
  color?: string;
  kilometraje?: string;
}

const Vehiculos: React.FC = () => {
  // Estado para la lista de vehículos
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([
    { placa: 'ABC123', marca: 'Toyota', modelo: 'Corolla', anio: '2020', tipo: 'Sedán', clienteCedula: '123456789', clienteNombre: 'Juan Pérez', color: 'Rojo', kilometraje: '45000' },
    { placa: 'XYZ789', marca: 'Honda', modelo: 'Civic', anio: '2019', tipo: 'Sedán', clienteCedula: '987654321', clienteNombre: 'María García', color: 'Azul', kilometraje: '52000' },
    { placa: 'DEF456', marca: 'Ford', modelo: 'Ranger', anio: '2021', tipo: 'Pickup', clienteCedula: '456789123', clienteNombre: 'Carlos López', color: 'Blanco', kilometraje: '28000' },
    { placa: 'GHI789', marca: 'Chevrolet', modelo: 'Spark', anio: '2018', tipo: 'Hatchback', clienteCedula: '321654987', clienteNombre: 'Ana Rodríguez', color: 'Negro', kilometraje: '65000' },
    { placa: 'JKL012', marca: 'Nissan', modelo: 'Sentra', anio: '2022', tipo: 'Sedán', clienteCedula: '789123456', clienteNombre: 'Pedro Martínez', color: 'Gris', kilometraje: '15000' },
    { placa: 'MNO345', marca: 'Mitsubishi', modelo: 'Montero', anio: '2017', tipo: 'SUV', clienteCedula: '654123987', clienteNombre: 'Laura Fernández', color: 'Plateado', kilometraje: '78000' },
    { placa: 'PQR678', marca: 'Hyundai', modelo: 'Tucson', anio: '2020', tipo: 'SUV', clienteCedula: '159753486', clienteNombre: 'Miguel Sánchez', color: 'Verde', kilometraje: '42000' },
    { placa: 'STU901', marca: 'Kia', modelo: 'Rio', anio: '2019', tipo: 'Sedán', clienteCedula: '357951852', clienteNombre: 'Isabel Gómez', color: 'Blanco', kilometraje: '38000' },
    { placa: 'VWX234', marca: 'Volkswagen', modelo: 'Gol', anio: '2016', tipo: 'Hatchback', clienteCedula: '258147369', clienteNombre: 'David Torres', color: 'Rojo', kilometraje: '92000' },
    { placa: 'YZA567', marca: 'Mazda', modelo: '3', anio: '2021', tipo: 'Sedán', clienteCedula: '741852963', clienteNombre: 'Carmen Ruiz', color: 'Azul Marino', kilometraje: '25000' },
    { placa: 'BCD890', marca: 'Subaru', modelo: 'Outback', anio: '2018', tipo: 'Wagon', clienteCedula: '369258147', clienteNombre: 'Jorge Díaz', color: 'Café', kilometraje: '68000' },
    { placa: 'EFG123', marca: 'BMW', modelo: 'X5', anio: '2023', tipo: 'SUV', clienteCedula: '852369147', clienteNombre: 'Elena Castro', color: 'Negro', kilometraje: '8000' },
    { placa: 'HIJ456', marca: 'Mercedes', modelo: 'Clase C', anio: '2020', tipo: 'Sedán', clienteCedula: '147258369', clienteNombre: 'Francisco Ortega', color: 'Plateado', kilometraje: '35000' },
    { placa: 'KLM789', marca: 'Audi', modelo: 'A4', anio: '2019', tipo: 'Sedán', clienteCedula: '963852741', clienteNombre: 'Sofía Navarro', color: 'Blanco', kilometraje: '42000' },
    { placa: 'NOP012', marca: 'Volvo', modelo: 'XC60', anio: '2022', tipo: 'SUV', clienteCedula: '321789654', clienteNombre: 'Raúl Jiménez', color: 'Azul', kilometraje: '18000' },
  ]);

  // Estados para búsqueda y selección
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Vehiculo | null>(null);
  const [showModalAgregar, setShowModalAgregar] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  
  // Estado para nuevo vehículo
  const [newVehiculo, setNewVehiculo] = useState<Vehiculo>({ 
    placa: '', 
    marca: '', 
    modelo: '', 
    anio: '', 
    tipo: 'Sedán',
    clienteCedula: '',
    clienteNombre: '',
    color: '',
    kilometraje: ''
  });

  // Estados para mensajes de error
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Opciones predefinidas
  const tiposVehiculo = ['Sedán', 'SUV', 'Pickup', 'Hatchback', 'Wagon', 'Camioneta', 'Deportivo', 'Motocicleta'];
  const marcasVehiculo = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Mitsubishi', 'Hyundai', 'Kia', 'Volkswagen', 'Mazda', 'Subaru', 'BMW', 'Mercedes', 'Audi', 'Volvo'];

  // Validaciones
  const soloNumeros = /^\d+$/;
  const formatoPlaca = /^[A-Z0-9]+$/;

  // Filtrar vehículos
  const vehiculosFiltrados = vehiculos.filter(v =>
    v.placa.toLowerCase().includes(search.toLowerCase()) ||
    v.marca.toLowerCase().includes(search.toLowerCase()) ||
    v.modelo.toLowerCase().includes(search.toLowerCase()) ||
    v.clienteNombre.toLowerCase().includes(search.toLowerCase())
  );

  /* === VALIDAR FORMULARIO === */
  const validarVehiculo = (vehiculo: Vehiculo, isEdit: boolean = false) => {
    const newErrors: {[key: string]: string} = {};

    // Validar placa
    if (!vehiculo.placa.trim()) {
      newErrors.placa = 'La placa es obligatoria';
    } else if (!formatoPlaca.test(vehiculo.placa.trim())) {
      newErrors.placa = 'Solo letras mayúsculas y números';
    } else if (!isEdit) {
      // Solo validar duplicado al agregar, no al editar
      const existe = vehiculos.find(v => v.placa === vehiculo.placa.trim());
      if (existe) {
        newErrors.placa = 'Placa ya registrada';
      }
    }

    // Validar marca
    if (!vehiculo.marca.trim()) {
      newErrors.marca = 'La marca es obligatoria';
    }

    // Validar modelo
    if (!vehiculo.modelo.trim()) {
      newErrors.modelo = 'El modelo es obligatorio';
    }

    // Validar año
    if (vehiculo.anio) {
      if (!soloNumeros.test(vehiculo.anio.trim())) {
        newErrors.anio = 'Solo números';
      } else if (parseInt(vehiculo.anio) < 1900 || parseInt(vehiculo.anio) > new Date().getFullYear() + 1) {
        newErrors.anio = 'Año inválido';
      }
    }

    // Validar cliente
    if (!vehiculo.clienteCedula.trim()) {
      newErrors.clienteCedula = 'Cliente es obligatorio';
    }

    // Validar kilometraje
    if (vehiculo.kilometraje && !soloNumeros.test(vehiculo.kilometraje.trim())) {
      newErrors.kilometraje = 'Solo números';
    }

    return newErrors;
  };

  /* === AGREGAR VEHÍCULO === */
  const agregarVehiculo = () => {
    const validationErrors = validarVehiculo(newVehiculo);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Crear vehículo con datos limpios
    const vehiculo: Vehiculo = {
      placa: newVehiculo.placa.trim().toUpperCase(),
      marca: newVehiculo.marca.trim(),
      modelo: newVehiculo.modelo.trim(),
      anio: newVehiculo.anio.trim(),
      tipo: newVehiculo.tipo,
      clienteCedula: newVehiculo.clienteCedula.trim(),
      clienteNombre: newVehiculo.clienteNombre.trim(),
      color: newVehiculo.color?.trim() || '',
      kilometraje: newVehiculo.kilometraje?.trim() || ''
    };

    setVehiculos([...vehiculos, vehiculo]);
    
    // Limpiar formulario y errores
    setNewVehiculo({ 
      placa: '', 
      marca: '', 
      modelo: '', 
      anio: '', 
      tipo: 'Sedán',
      clienteCedula: '',
      clienteNombre: '',
      color: '',
      kilometraje: ''
    });
    setErrors({});
    setShowModalAgregar(false);
    
    alert('Vehículo agregado exitosamente');
  };

  /* === EDITAR VEHÍCULO === */
  const guardarEdicion = () => {
    if (!selected) return;

    const validationErrors = validarVehiculo(selected, true);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Actualizar vehículo en la lista
    setVehiculos(vehiculos.map(v => 
      v.placa === selected.placa ? selected : v
    ));
    
    setErrors({});
    setShowModalEditar(false);
    
    alert('Vehículo actualizado exitosamente');
  };

  /* === ELIMINAR VEHÍCULO === */
  const eliminarVehiculo = (placa: string) => {
    if (!confirm('¿Está seguro de eliminar este vehículo?')) return;

    setVehiculos(vehiculos.filter(v => v.placa !== placa));
    setSelected(null);
    alert('Vehículo eliminado');
  };

  /* === LIMPIAR ERRORES === */
  const limpiarErrores = () => {
    setErrors({});
  };

  return (
    <div className="gestion-vehiculos">
      <div className="header-section">
        <div className="stats">
          <span className="stat-item">Total: {vehiculos.length} vehículos</span>
          <span className="stat-item">Mostrando: {vehiculosFiltrados.length}</span>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL CON LISTA Y DETALLES */}
      <div className="contenedor-principal">
        {/* CONTENEDOR IZQUIERDO - LISTA DE VEHÍCULOS */}
        <div className="contenedor-lista">
          {/* BARRA DE BÚSQUEDA Y BOTÓN */}
          <div className="busqueda-agregar">
            <input
              className="search-bar"
              placeholder="Buscar por placa, marca, modelo o cliente..."
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
              Agregar Vehículo
            </button>
          </div>

          {/* TABLA DE VEHÍCULOS CON SCROLL */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Placa</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Año</th>
                  <th>Tipo</th>
                  <th>Cliente</th>
                </tr>
              </thead>
              <tbody>
                {vehiculosFiltrados.map((vehiculo, index) => (
                  <tr 
                    key={`${vehiculo.placa}-${index}`}
                    className={selected?.placa === vehiculo.placa ? 'selected-row' : ''}
                    onClick={() => setSelected(vehiculo)}
                  >
                    <td className="placa-column">{vehiculo.placa}</td>
                    <td>{vehiculo.marca}</td>
                    <td>{vehiculo.modelo}</td>
                    <td>{vehiculo.anio || 'N/A'}</td>
                    <td>{vehiculo.tipo}</td>
                    <td>{vehiculo.clienteNombre}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {vehiculosFiltrados.length === 0 && (
              <div className="no-results">
                {search ? 'No se encontraron vehículos' : 'No hay vehículos registrados'}
              </div>
            )}
          </div>
        </div>

        {/* CONTENEDOR DERECHO - DETALLES DEL VEHÍCULO SELECCIONADO */}
        {selected && !showModalEditar && (
          <div className="contenedor-detalles">
            <div className="sidebar-details">
              <div className="sidebar-header">
                <h4>Detalles del Vehículo</h4>
                <button 
                  className="btn-close" 
                  onClick={() => setSelected(null)}
                >
                  ×
                </button>
              </div>
              
              <div className="sidebar-body">
                <div className="detail-item">
                  <span className="detail-label">Placa:</span>
                  <span className="detail-value placa-value">{selected.placa}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Marca:</span>
                  <span className="detail-value">{selected.marca}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Modelo:</span>
                  <span className="detail-value">{selected.modelo}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Año:</span>
                  <span className="detail-value">{selected.anio || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Tipo:</span>
                  <span className="detail-value">{selected.tipo}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Color:</span>
                  <span className="detail-value">{selected.color || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Kilometraje:</span>
                  <span className="detail-value">{selected.kilometraje || 'N/A'} km</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Cliente:</span>
                  <span className="detail-value">{selected.clienteNombre}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Cédula Cliente:</span>
                  <span className="detail-value">{selected.clienteCedula}</span>
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
                  Editar Vehículo
                </button>
                <button 
                  className="boton boton-eliminar"
                  onClick={() => eliminarVehiculo(selected.placa)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL AGREGAR VEHÍCULO */}
      {showModalAgregar && (
        <div className="modal-overlay" onClick={() => {
          setShowModalAgregar(false);
          limpiarErrores();
        }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agregar Nuevo Vehículo</h3>
              <button 
                className="btn-close" 
                onClick={() => setShowModalAgregar(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Placa *</label>
                <input
                  placeholder="Ej: ABC123"
                  value={newVehiculo.placa}
                  onChange={e => setNewVehiculo({ ...newVehiculo, placa: e.target.value.toUpperCase() })}
                  className={errors.placa ? 'input-error' : ''}
                />
                {errors.placa && <span className="error-message">{errors.placa}</span>}
              </div>
              
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
                  placeholder="Ej: Corolla, Civic, etc."
                  value={newVehiculo.modelo}
                  onChange={e => setNewVehiculo({ ...newVehiculo, modelo: e.target.value })}
                  className={errors.modelo ? 'input-error' : ''}
                />
                {errors.modelo && <span className="error-message">{errors.modelo}</span>}
              </div>
              
              <div className="form-group">
                <label>Año</label>
                <input
                  placeholder="Ej: 2020"
                  value={newVehiculo.anio}
                  onChange={e => setNewVehiculo({ ...newVehiculo, anio: e.target.value })}
                  className={errors.anio ? 'input-error' : ''}
                />
                {errors.anio && <span className="error-message">{errors.anio}</span>}
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
                <label>Color</label>
                <input
                  placeholder="Ej: Rojo, Azul, etc."
                  value={newVehiculo.color}
                  onChange={e => setNewVehiculo({ ...newVehiculo, color: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label>Kilometraje</label>
                <input
                  placeholder="Ej: 45000"
                  value={newVehiculo.kilometraje}
                  onChange={e => setNewVehiculo({ ...newVehiculo, kilometraje: e.target.value })}
                  className={errors.kilometraje ? 'input-error' : ''}
                />
                {errors.kilometraje && <span className="error-message">{errors.kilometraje}</span>}
              </div>
              
              <div className="form-group">
                <label>Cédula del Cliente *</label>
                <input
                  placeholder="Cédula del cliente propietario"
                  value={newVehiculo.clienteCedula}
                  onChange={e => setNewVehiculo({ ...newVehiculo, clienteCedula: e.target.value })}
                  className={errors.clienteCedula ? 'input-error' : ''}
                />
                {errors.clienteCedula && <span className="error-message">{errors.clienteCedula}</span>}
              </div>
              
              <div className="form-group">
                <label>Nombre del Cliente</label>
                <input
                  placeholder="Nombre del cliente propietario"
                  value={newVehiculo.clienteNombre}
                  onChange={e => setNewVehiculo({ ...newVehiculo, clienteNombre: e.target.value })}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="boton boton-guardar" onClick={agregarVehiculo}>
                Guardar Vehículo
              </button>
              <button className="boton boton-cancelar" onClick={() => setShowModalAgregar(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR VEHÍCULO */}
      {showModalEditar && selected && (
        <div className="modal-overlay" onClick={() => {
          setShowModalEditar(false);
          limpiarErrores();
        }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Vehículo</h3>
              <button 
                className="btn-close" 
                onClick={() => setShowModalEditar(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Placa</label>
                <input
                  value={selected.placa}
                  disabled
                  className="input-disabled"
                />
                <small className="field-info">La placa no se puede modificar</small>
              </div>
              
              <div className="form-group">
                <label>Marca *</label>
                <select
                  value={selected.marca}
                  onChange={e => setSelected({ ...selected, marca: e.target.value })}
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
                  placeholder="Ej: Corolla, Civic, etc."
                  value={selected.modelo}
                  onChange={e => setSelected({ ...selected, modelo: e.target.value })}
                  className={errors.modelo ? 'input-error' : ''}
                />
                {errors.modelo && <span className="error-message">{errors.modelo}</span>}
              </div>
              
              <div className="form-group">
                <label>Año</label>
                <input
                  placeholder="Ej: 2020"
                  value={selected.anio}
                  onChange={e => setSelected({ ...selected, anio: e.target.value })}
                  className={errors.anio ? 'input-error' : ''}
                />
                {errors.anio && <span className="error-message">{errors.anio}</span>}
              </div>
              
              <div className="form-group">
                <label>Tipo</label>
                <select
                  value={selected.tipo}
                  onChange={e => setSelected({ ...selected, tipo: e.target.value })}
                >
                  {tiposVehiculo.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Color</label>
                <input
                  placeholder="Ej: Rojo, Azul, etc."
                  value={selected.color || ''}
                  onChange={e => setSelected({ ...selected, color: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label>Kilometraje</label>
                <input
                  placeholder="Ej: 45000"
                  value={selected.kilometraje || ''}
                  onChange={e => setSelected({ ...selected, kilometraje: e.target.value })}
                  className={errors.kilometraje ? 'input-error' : ''}
                />
                {errors.kilometraje && <span className="error-message">{errors.kilometraje}</span>}
              </div>
              
              <div className="form-group">
                <label>Cédula del Cliente *</label>
                <input
                  placeholder="Cédula del cliente propietario"
                  value={selected.clienteCedula}
                  onChange={e => setSelected({ ...selected, clienteCedula: e.target.value })}
                  className={errors.clienteCedula ? 'input-error' : ''}
                />
                {errors.clienteCedula && <span className="error-message">{errors.clienteCedula}</span>}
              </div>
              
              <div className="form-group">
                <label>Nombre del Cliente</label>
                <input
                  placeholder="Nombre del cliente propietario"
                  value={selected.clienteNombre}
                  onChange={e => setSelected({ ...selected, clienteNombre: e.target.value })}
                />
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

export default Vehiculos;