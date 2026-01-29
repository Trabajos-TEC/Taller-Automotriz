-- Schema SQL para Taller Automotriz
-- Base de datos Neon PostgreSQL

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    cedula VARCHAR(50) NOT NULL UNIQUE,
    correo VARCHAR(255),
    numero VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para búsquedas rápidas por cédula
CREATE INDEX IF NOT EXISTS idx_clientes_cedula ON clientes(cedula);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(nombre);

-- Tabla de usuarios del sistema
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(255) NOT NULL UNIQUE,
    cedula VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    roles VARCHAR(50) NOT NULL CHECK (roles IN ('admin', 'mecanico', 'cliente')),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo);
CREATE INDEX IF NOT EXISTS idx_usuarios_cedula ON usuarios(cedula);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);

-- Tabla de vehículos base (catálogo de modelos)
CREATE TABLE IF NOT EXISTS vehiculos_base (
    id SERIAL PRIMARY KEY,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    anio INTEGER NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para vehículos base
CREATE INDEX IF NOT EXISTS idx_vehiculos_base_marca ON vehiculos_base(marca);
CREATE INDEX IF NOT EXISTS idx_vehiculos_base_modelo ON vehiculos_base(modelo);
CREATE INDEX IF NOT EXISTS idx_vehiculos_base_tipo ON vehiculos_base(tipo);

-- Restricción única para evitar duplicados
CREATE UNIQUE INDEX IF NOT EXISTS idx_vehiculos_base_unique 
ON vehiculos_base(marca, modelo, anio, tipo);

-- Tabla de vehículos de clientes
CREATE TABLE IF NOT EXISTS vehiculos_clientes (
    id SERIAL PRIMARY KEY,
    placa VARCHAR(50) NOT NULL UNIQUE,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    vehiculo_base_id INTEGER NOT NULL REFERENCES vehiculos_base(id) ON DELETE RESTRICT,
    color VARCHAR(50),
    kilometraje INTEGER,
    anio_matricula VARCHAR(4),
    vin VARCHAR(100),
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para vehículos clientes
CREATE INDEX IF NOT EXISTS idx_vehiculos_clientes_placa ON vehiculos_clientes(placa);
CREATE INDEX IF NOT EXISTS idx_vehiculos_clientes_cliente_id ON vehiculos_clientes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_vehiculos_clientes_vehiculo_base_id ON vehiculos_clientes(vehiculo_base_id);
CREATE INDEX IF NOT EXISTS idx_vehiculos_clientes_vin ON vehiculos_clientes(vin);

-- Tabla de inventario
CREATE TABLE IF NOT EXISTS inventario (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(100) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100) NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
    cantidad_minima INTEGER NOT NULL DEFAULT 0 CHECK (cantidad_minima >= 0),
    precio_compra DECIMAL(10, 2) NOT NULL CHECK (precio_compra >= 0),
    precio_venta DECIMAL(10, 2) NOT NULL CHECK (precio_venta >= 0),
    proveedor VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para inventario
CREATE INDEX IF NOT EXISTS idx_inventario_codigo ON inventario(codigo);
CREATE INDEX IF NOT EXISTS idx_inventario_nombre ON inventario(nombre);
CREATE INDEX IF NOT EXISTS idx_inventario_categoria ON inventario(categoria);

-- Tabla de relación inventario-vehículos (qué productos son compatibles con qué vehículos)
CREATE TABLE IF NOT EXISTS inventario_vehiculos (
    id SERIAL PRIMARY KEY,
    inventario_id INTEGER NOT NULL REFERENCES inventario(id) ON DELETE CASCADE,
    vehiculo_base_id INTEGER NOT NULL REFERENCES vehiculos_base(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(inventario_id, vehiculo_base_id)
);

-- Índices para inventario_vehiculos
CREATE INDEX IF NOT EXISTS idx_inventario_vehiculos_inventario ON inventario_vehiculos(inventario_id);
CREATE INDEX IF NOT EXISTS idx_inventario_vehiculos_vehiculo ON inventario_vehiculos(vehiculo_base_id);

-- Tabla de talleres (opcional - basada en types)
CREATE TABLE IF NOT EXISTS talleres (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    direccion TEXT,
    telefono VARCHAR(50),
    ruc VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para talleres
CREATE INDEX IF NOT EXISTS idx_talleres_ruc ON talleres(ruc);

-- Tabla de trabajadores (opcional - basada en types)
CREATE TABLE IF NOT EXISTS trabajadores (
    id SERIAL PRIMARY KEY,
    taller_id INTEGER REFERENCES talleres(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    cedula VARCHAR(50) NOT NULL UNIQUE,
    correo VARCHAR(255) NOT NULL,
    numero VARCHAR(50),
    contrasena VARCHAR(255) NOT NULL,
    roles VARCHAR(50) NOT NULL CHECK (roles IN ('mecanico', 'administrador', 'supervisor')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para trabajadores
CREATE INDEX IF NOT EXISTS idx_trabajadores_cedula ON trabajadores(cedula);
CREATE INDEX IF NOT EXISTS idx_trabajadores_taller_id ON trabajadores(taller_id);

-- Tabla de relación cliente-taller
CREATE TABLE IF NOT EXISTS clientes_talleres (
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    taller_id INTEGER NOT NULL REFERENCES talleres(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cliente_id, taller_id)
);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en inventario
CREATE TRIGGER update_inventario_updated_at 
    BEFORE UPDATE ON inventario 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar updated_at en usuarios
CREATE TRIGGER update_usuarios_updated_at 
    BEFORE UPDATE ON usuarios 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Datos de ejemplo para testing (opcional)
-- Usuario admin por defecto (password: admin123 - hash bcrypt)
INSERT INTO usuarios (nombre, correo, cedula, password_hash, roles) 
VALUES (
    'Administrador',
    'admin@taller.com',
    '0000000000',
    '$2b$10$YourHashedPasswordHere',
    'admin'
) ON CONFLICT (correo) DO NOTHING;

-- Comentarios para documentación
COMMENT ON TABLE clientes IS 'Tabla de clientes del taller';
COMMENT ON TABLE usuarios IS 'Usuarios del sistema con autenticación';
COMMENT ON TABLE vehiculos_base IS 'Catálogo de modelos de vehículos';
COMMENT ON TABLE vehiculos_clientes IS 'Vehículos específicos de cada cliente';
COMMENT ON TABLE inventario IS 'Inventario de productos y repuestos';
COMMENT ON TABLE inventario_vehiculos IS 'Compatibilidad entre productos y vehículos';
