-- =====================================================
-- SCRIPT: Crear tabla de REPORTES
-- Descripción: Sistema de reportes de incidencias/issues
-- Ejecutar en: Neon SQL Editor
-- =====================================================

-- 1️⃣ Crear tabla REPORTES
CREATE TABLE IF NOT EXISTS reportes (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL, -- 'Clientes', 'Vehiculos', 'Inventario', 'Sistema'
    usuario VARCHAR(100) NOT NULL, -- Nombre del usuario que reporta
    descripcion TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en-proceso', 'atendido')),
    detalles JSONB, -- Información adicional flexible
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2️⃣ Crear índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_reportes_estado ON reportes(estado);
CREATE INDEX IF NOT EXISTS idx_reportes_tipo ON reportes(tipo);
CREATE INDEX IF NOT EXISTS idx_reportes_fecha ON reportes(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_reportes_usuario ON reportes(usuario);

-- 3️⃣ Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_reportes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reportes_updated_at
    BEFORE UPDATE ON reportes
    FOR EACH ROW
    EXECUTE FUNCTION update_reportes_updated_at();

-- 4️⃣ Insertar datos de ejemplo (seed)
INSERT INTO reportes (tipo, usuario, descripcion, fecha, estado, detalles) VALUES
('Clientes', 'Juan Pérez', 'Error al actualizar información de cliente ABC-123', CURRENT_TIMESTAMP - INTERVAL '2 days', 'pendiente', '{"cliente_id": 1, "placa": "ABC-123"}'),
('Vehiculos', 'María González', 'No se puede agregar vehículo nuevo', CURRENT_TIMESTAMP - INTERVAL '1 day', 'en-proceso', '{"error": "VIN duplicado"}'),
('Inventario', 'Admin Sistema', 'Stock bajo en filtros de aceite', CURRENT_TIMESTAMP - INTERVAL '3 hours', 'pendiente', '{"producto": "FIL-001", "cantidad": 5}'),
('Sistema', 'Juan Pérez', 'Lentitud en carga de reportes', CURRENT_TIMESTAMP - INTERVAL '5 days', 'atendido', '{"tiempo_carga": "5s"}'),
('Clientes', 'Carlos Rojas', 'Cliente no aparece en búsqueda', CURRENT_TIMESTAMP - INTERVAL '12 hours', 'pendiente', '{"busqueda": "Rodriguez", "resultado": "0"}'),
('Inventario', 'Ana López', 'Descuadre en inventario de llantas', CURRENT_TIMESTAMP - INTERVAL '6 hours', 'en-proceso', '{"producto": "LLA-205-55-R16", "diferencia": 3}'),
('Sistema', 'María González', 'Error 500 al generar reporte PDF', CURRENT_TIMESTAMP - INTERVAL '18 hours', 'pendiente', '{"endpoint": "/reportes/pdf", "codigo": 500}'),
('Vehiculos', 'Admin Sistema', 'VIN duplicado en base de datos', CURRENT_TIMESTAMP - INTERVAL '4 days', 'atendido', '{"vin": "1HGBH41JXMN109186", "vehiculos": [12, 45]}'),
('Clientes', 'Juan Pérez', 'No se envían correos de confirmación', CURRENT_TIMESTAMP - INTERVAL '8 hours', 'en-proceso', '{"email": "cliente@example.com", "tipo": "confirmacion"}'),
('Sistema', 'Carlos Rojas', 'Sesión expira muy rápido', CURRENT_TIMESTAMP - INTERVAL '2 hours', 'pendiente', '{"tiempo_sesion": "5min", "esperado": "30min"}');

-- 5️⃣ Verificar creación
SELECT 
    COUNT(*) as total_reportes,
    COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
    COUNT(CASE WHEN estado = 'en-proceso' THEN 1 END) as en_proceso,
    COUNT(CASE WHEN estado = 'atendido' THEN 1 END) as atendidos
FROM reportes;

-- ✅ SCRIPT COMPLETO
-- Ejecutar todo el script en Neon SQL Editor
