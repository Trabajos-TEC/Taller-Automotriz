-- Migración: Agregar tabla de cotizaciones
-- Fecha: 2026-02-03
-- Descripción: Crea la tabla cotizaciones para gestionar cotizaciones y proformas

-- Tabla de cotizaciones
CREATE TABLE IF NOT EXISTS cotizaciones (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    cliente_nombre VARCHAR(255) NOT NULL,
    cliente_cedula VARCHAR(50) NOT NULL,
    vehiculo_placa VARCHAR(50) NOT NULL,
    descuento_mano_obra DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (descuento_mano_obra >= 0 AND descuento_mano_obra <= 100),
    subtotal_repuestos DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (subtotal_repuestos >= 0),
    subtotal_mano_obra DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (subtotal_mano_obra >= 0),
    iva DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (iva >= 0),
    total DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('borrador', 'pendiente', 'aprobada', 'rechazada')) DEFAULT 'borrador',
    es_proforma BOOLEAN NOT NULL DEFAULT false,
    codigo_orden_trabajo VARCHAR(50),
    mecanico_orden_trabajo VARCHAR(255),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para cotizaciones
CREATE INDEX IF NOT EXISTS idx_cotizaciones_codigo ON cotizaciones(codigo);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_cliente_cedula ON cotizaciones(cliente_cedula);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_vehiculo_placa ON cotizaciones(vehiculo_placa);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_estado ON cotizaciones(estado);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_fecha_creacion ON cotizaciones(fecha_creacion DESC);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_codigo_orden ON cotizaciones(codigo_orden_trabajo);

-- Trigger para updated_at en cotizaciones
CREATE TRIGGER cotizaciones_updated_at_trigger
    BEFORE UPDATE ON cotizaciones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentario para documentación
COMMENT ON TABLE cotizaciones IS 'Cotizaciones y proformas generadas para clientes';
COMMENT ON COLUMN cotizaciones.codigo IS 'Código único de la cotización (ej: COT-0001)';
COMMENT ON COLUMN cotizaciones.descuento_mano_obra IS 'Porcentaje de descuento aplicado a mano de obra (0-100)';
COMMENT ON COLUMN cotizaciones.es_proforma IS 'Indica si es una proforma (true) o cotización simple (false)';
COMMENT ON COLUMN cotizaciones.codigo_orden_trabajo IS 'Código de la orden de trabajo asociada (si aplica)';
COMMENT ON COLUMN cotizaciones.estado IS 'Estado: borrador, pendiente, aprobada, rechazada';

-- Insertar datos de ejemplo para testing
INSERT INTO cotizaciones (
    codigo, 
    cliente_nombre, 
    cliente_cedula, 
    vehiculo_placa,
    descuento_mano_obra,
    subtotal_repuestos,
    subtotal_mano_obra,
    iva,
    total,
    estado,
    es_proforma,
    mecanico_orden_trabajo
) VALUES 
(
    'COT-0001',
    'Juan Pérez',
    '123456789',
    'ABC-123',
    10,
    37000,
    15000,
    6760,
    58760,
    'borrador',
    false,
    'Mecánico 1'
),
(
    'COT-0002',
    'María García',
    '987654321',
    'XYZ-789',
    0,
    36000,
    35000,
    9230,
    80230,
    'aprobada',
    true,
    'Mecánico 2'
)
ON CONFLICT (codigo) DO NOTHING;
