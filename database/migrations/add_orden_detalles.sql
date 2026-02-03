-- Migración para agregar tablas de detalles de órdenes de trabajo
-- Ejecutar: psql -h <host> -U <user> -d <database> -f add_orden_detalles.sql

-- Tabla para repuestos utilizados en órdenes de trabajo
CREATE TABLE IF NOT EXISTS orden_repuestos (
    id SERIAL PRIMARY KEY,
    orden_trabajo_id INTEGER NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
    producto_codigo VARCHAR(50) NOT NULL,
    producto_nombre VARCHAR(200) NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para servicios realizados en órdenes de trabajo
CREATE TABLE IF NOT EXISTS orden_servicios (
    id SERIAL PRIMARY KEY,
    orden_trabajo_id INTEGER NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
    servicio_codigo VARCHAR(50) NOT NULL,
    servicio_nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_orden_repuestos_orden ON orden_repuestos(orden_trabajo_id);
CREATE INDEX IF NOT EXISTS idx_orden_servicios_orden ON orden_servicios(orden_trabajo_id);

-- Comentarios para documentación
COMMENT ON TABLE orden_repuestos IS 'Repuestos utilizados en cada orden de trabajo';
COMMENT ON TABLE orden_servicios IS 'Servicios realizados en cada orden de trabajo';
