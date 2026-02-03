-- Script para limpiar todos los datos de las tablas
-- ADVERTENCIA: Esto eliminará TODOS los datos de prueba

-- Eliminar datos en orden inverso a las dependencias
TRUNCATE TABLE orden_servicios CASCADE;
TRUNCATE TABLE orden_repuestos CASCADE;
TRUNCATE TABLE ordenes_trabajo CASCADE;
TRUNCATE TABLE citas CASCADE;
TRUNCATE TABLE vehiculos_clientes CASCADE;
TRUNCATE TABLE clientes_talleres CASCADE;
TRUNCATE TABLE inventario_vehiculos CASCADE;
TRUNCATE TABLE inventario CASCADE;
TRUNCATE TABLE vehiculos_base CASCADE;
TRUNCATE TABLE servicios CASCADE;
TRUNCATE TABLE clientes CASCADE;

-- Resetear secuencias (opcional, para que los IDs vuelvan a 1)
ALTER SEQUENCE clientes_id_seq RESTART WITH 1;
ALTER SEQUENCE vehiculos_base_id_seq RESTART WITH 1;
ALTER SEQUENCE inventario_id_seq RESTART WITH 1;
ALTER SEQUENCE vehiculos_clientes_id_seq RESTART WITH 1;
ALTER SEQUENCE citas_id_seq RESTART WITH 1;
ALTER SEQUENCE servicios_id_seq RESTART WITH 1;
ALTER SEQUENCE ordenes_trabajo_id_seq RESTART WITH 1;
ALTER SEQUENCE orden_repuestos_id_seq RESTART WITH 1;
ALTER SEQUENCE orden_servicios_id_seq RESTART WITH 1;

SELECT 'Limpieza completada' AS resultado;
