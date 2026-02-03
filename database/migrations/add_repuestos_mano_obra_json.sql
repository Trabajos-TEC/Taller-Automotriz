-- Migración: Agregar columnas JSON para repuestos y servicios en cotizaciones
-- Fecha: 2026-02-03
-- Descripción: Agrega campos JSONB para guardar repuestos y mano de obra

-- Agregar columnas JSONB
ALTER TABLE cotizaciones 
ADD COLUMN IF NOT EXISTS repuestos JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS mano_obra JSONB DEFAULT '[]'::jsonb;

-- Índices para búsquedas en JSON (opcional, mejora performance)
CREATE INDEX IF NOT EXISTS idx_cotizaciones_repuestos ON cotizaciones USING GIN (repuestos);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_mano_obra ON cotizaciones USING GIN (mano_obra);

-- Comentarios
COMMENT ON COLUMN cotizaciones.repuestos IS 'Array JSON de repuestos: [{ codigo, nombre, cantidad, precio, subtotal }]';
COMMENT ON COLUMN cotizaciones.mano_obra IS 'Array JSON de servicios: [{ codigo, nombre, descripcion, horas, tarifa }]';

-- Actualizar cotizaciones existentes con arrays vacíos si son NULL
UPDATE cotizaciones SET repuestos = '[]'::jsonb WHERE repuestos IS NULL;
UPDATE cotizaciones SET mano_obra = '[]'::jsonb WHERE mano_obra IS NULL;
