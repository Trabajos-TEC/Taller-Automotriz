-- Script para agregar tablas servicios y ordenes_trabajo
-- Ejecuta este script si las tablas no se crearon en la primera ejecución

-- PASO 1: Crear tabla de servicios (mano de obra) primero
CREATE TABLE IF NOT EXISTS servicios (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL DEFAULT 0,
    duracion_estimada INTEGER, -- en minutos
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para servicios
CREATE INDEX IF NOT EXISTS idx_servicios_codigo ON servicios(codigo);
CREATE INDEX IF NOT EXISTS idx_servicios_activo ON servicios(activo);

-- Trigger para updated_at en servicios
DROP TRIGGER IF EXISTS servicios_updated_at_trigger ON servicios;
CREATE TRIGGER servicios_updated_at_trigger
    BEFORE UPDATE ON servicios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE servicios IS 'Servicios de mano de obra ofrecidos por el taller';

-- PASO 2: Crear tabla de órdenes de trabajo (servicios aplicados a vehículos)
CREATE TABLE IF NOT EXISTS ordenes_trabajo (
    id SERIAL PRIMARY KEY,
    vehiculo_cliente_id INTEGER NOT NULL REFERENCES vehiculos_clientes(id) ON DELETE CASCADE,
    servicio_id INTEGER REFERENCES servicios(id) ON DELETE SET NULL,
    tipo_servicio VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_entrada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_salida TIMESTAMP,
    costo DECIMAL(10,2) NOT NULL DEFAULT 0,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('pendiente', 'en_proceso', 'completado', 'cancelado')) DEFAULT 'pendiente',
    mecanico_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para órdenes de trabajo
CREATE INDEX IF NOT EXISTS idx_ordenes_vehiculo ON ordenes_trabajo(vehiculo_cliente_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_servicio ON ordenes_trabajo(servicio_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON ordenes_trabajo(estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_mecanico ON ordenes_trabajo(mecanico_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_fecha_entrada ON ordenes_trabajo(fecha_entrada);

-- Trigger para updated_at en ordenes_trabajo
DROP TRIGGER IF EXISTS ordenes_trabajo_updated_at_trigger ON ordenes_trabajo;
CREATE TRIGGER ordenes_trabajo_updated_at_trigger
    BEFORE UPDATE ON ordenes_trabajo
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentario para documentación
COMMENT ON TABLE ordenes_trabajo IS 'Órdenes de trabajo aplicadas a vehículos de clientes';

-- Verificar que la tabla se creó correctamente
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'ordenes_trabajo'
ORDER BY ordinal_position;
