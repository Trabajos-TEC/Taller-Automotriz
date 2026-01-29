-- Datos iniciales para la base de datos Taller Automotriz

-- Limpiar datos existentes (opcional - usar con cuidado en producción)
-- TRUNCATE TABLE inventario_vehiculos, vehiculos_clientes, clientes, vehiculos_base, inventario, usuarios, trabajadores, clientes_talleres, talleres CASCADE;

-- Insertar vehículos base (catálogo de modelos)
INSERT INTO vehiculos_base (marca, modelo, anio, tipo) VALUES
    ('Toyota', 'Corolla', 2020, 'Sedán'),
    ('Toyota', 'Hilux', 2021, 'Pickup'),
    ('Toyota', 'RAV4', 2022, 'SUV'),
    ('Honda', 'Civic', 2020, 'Sedán'),
    ('Honda', 'CR-V', 2021, 'SUV'),
    ('Nissan', 'Sentra', 2019, 'Sedán'),
    ('Nissan', 'Frontier', 2022, 'Pickup'),
    ('Ford', 'F-150', 2021, 'Pickup'),
    ('Ford', 'Escape', 2020, 'SUV'),
    ('Chevrolet', 'Spark', 2021, 'Hatchback'),
    ('Chevrolet', 'Silverado', 2022, 'Pickup'),
    ('Mazda', 'CX-5', 2021, 'SUV'),
    ('Mazda', '3', 2020, 'Sedán'),
    ('Hyundai', 'Elantra', 2021, 'Sedán'),
    ('Hyundai', 'Tucson', 2022, 'SUV')
ON CONFLICT (marca, modelo, anio, tipo) DO NOTHING;

-- Insertar clientes de ejemplo
INSERT INTO clientes (nombre, cedula, correo, numero) VALUES
    ('Juan Pérez', '1234567890', 'juan.perez@email.com', '88887777'),
    ('María González', '0987654321', 'maria.gonzalez@email.com', '88886666'),
    ('Carlos Rodríguez', '1122334455', 'carlos.rodriguez@email.com', '88885555'),
    ('Ana Martínez', '5544332211', 'ana.martinez@email.com', '88884444'),
    ('Pedro Sánchez', '6677889900', 'pedro.sanchez@email.com', '88883333')
ON CONFLICT (cedula) DO NOTHING;

-- Insertar productos en inventario
INSERT INTO inventario (codigo, nombre, descripcion, categoria, cantidad, cantidad_minima, precio_compra, precio_venta, proveedor) VALUES
    ('ACE-001', 'Aceite Motor 10W-40', 'Aceite sintético para motor', 'Lubricantes', 50, 10, 8.50, 15.00, 'Castrol'),
    ('FIL-001', 'Filtro de Aceite', 'Filtro estándar universal', 'Filtros', 100, 20, 3.50, 7.00, 'Mann Filter'),
    ('FIL-002', 'Filtro de Aire', 'Filtro de aire para motor', 'Filtros', 80, 15, 5.00, 10.00, 'Bosch'),
    ('BAT-001', 'Batería 12V 60Ah', 'Batería libre de mantenimiento', 'Baterías', 30, 5, 80.00, 150.00, 'Bosch'),
    ('PAS-001', 'Pastillas de Freno Delanteras', 'Juego de pastillas cerámicas', 'Frenos', 60, 10, 25.00, 50.00, 'Brembo'),
    ('DIS-001', 'Disco de Freno', 'Disco ventilado 280mm', 'Frenos', 40, 8, 35.00, 70.00, 'Brembo'),
    ('BUJ-001', 'Bujías NGK', 'Juego de 4 bujías', 'Sistema Eléctrico', 120, 20, 15.00, 30.00, 'NGK'),
    ('LLA-001', 'Llanta 205/55 R16', 'Llanta radial para sedán', 'Llantas', 50, 10, 60.00, 120.00, 'Michelin'),
    ('AMO-001', 'Amortiguador Delantero', 'Amortiguador gas presurizado', 'Suspensión', 30, 5, 45.00, 90.00, 'Monroe'),
    ('COR-001', 'Correa de Distribución', 'Kit completo con tensor', 'Motor', 25, 5, 55.00, 110.00, 'Gates')
ON CONFLICT (codigo) DO NOTHING;

-- Insertar talleres
INSERT INTO talleres (nombre, direccion, telefono, ruc) VALUES
    ('Taller Central', 'Av. Principal 123, San José', '2222-3333', '3-101-123456'),
    ('AutoServicio Norte', 'Calle 5, Heredia', '2244-5566', '3-101-654321')
ON CONFLICT (ruc) DO NOTHING;

-- Insertar usuarios del sistema con contraseñas hasheadas
-- Nota: Por simplicidad, las contraseñas son las cédulas (temporalmente)
-- En producción, usar bcrypt: await bcrypt.hash('password', 10)
INSERT INTO usuarios (nombre, correo, cedula, password_hash, roles, activo) VALUES
    ('Admin Sistema', 'admin@taller.com', '9999999999', 'admin123', 'admin', true),
    ('Juan Pérez', 'juan.perez@taller.com', '1234567890', '1234567890', 'mecanico', true),
    ('María González', 'maria.gonzalez@taller.com', '0987654321', '0987654321', 'cliente', true)
ON CONFLICT (correo) DO NOTHING;

-- Asociar vehículos de clientes
-- Primero obtener IDs de clientes y vehículos base para crear vehículos específicos
INSERT INTO vehiculos_clientes (placa, cliente_id, vehiculo_base_id, color, kilometraje, vin, notas)
SELECT 
    'ABC-123',
    (SELECT id FROM clientes WHERE cedula = '1234567890' LIMIT 1),
    (SELECT id FROM vehiculos_base WHERE marca = 'Toyota' AND modelo = 'Corolla' AND anio = 2020 LIMIT 1),
    'Rojo',
    45000,
    '1HGBH41JXMN109186',
    'Cliente frecuente, último servicio hace 3 meses'
WHERE NOT EXISTS (SELECT 1 FROM vehiculos_clientes WHERE placa = 'ABC-123');

INSERT INTO vehiculos_clientes (placa, cliente_id, vehiculo_base_id, color, kilometraje, vin, notas)
SELECT 
    'XYZ-789',
    (SELECT id FROM clientes WHERE cedula = '0987654321' LIMIT 1),
    (SELECT id FROM vehiculos_base WHERE marca = 'Honda' AND modelo = 'CR-V' AND anio = 2021 LIMIT 1),
    'Azul',
    12000,
    '2HGFB2F59EH542398',
    'Vehículo nuevo, primera revisión'
WHERE NOT EXISTS (SELECT 1 FROM vehiculos_clientes WHERE placa = 'XYZ-789');

INSERT INTO vehiculos_clientes (placa, cliente_id, vehiculo_base_id, color, kilometraje, vin, notas)
SELECT 
    'LMN-456',
    (SELECT id FROM clientes WHERE cedula = '1122334455' LIMIT 1),
    (SELECT id FROM vehiculos_base WHERE marca = 'Nissan' AND modelo = 'Frontier' AND anio = 2022 LIMIT 1),
    'Blanco',
    25000,
    '1N6DD26T66C438880',
    'Uso comercial, mantenimiento cada 5000 km'
WHERE NOT EXISTS (SELECT 1 FROM vehiculos_clientes WHERE placa = 'LMN-456');

-- Asociar productos con vehículos compatibles (inventario_vehiculos)
-- Aceite 10W-40 compatible con Toyota Corolla, Honda Civic, Nissan Sentra
INSERT INTO inventario_vehiculos (inventario_id, vehiculo_base_id)
SELECT i.id, vb.id
FROM inventario i
CROSS JOIN vehiculos_base vb
WHERE i.codigo = 'ACE-001'
  AND vb.modelo IN ('Corolla', 'Civic', 'Sentra')
ON CONFLICT (inventario_id, vehiculo_base_id) DO NOTHING;

-- Filtros compatibles con múltiples vehículos
INSERT INTO inventario_vehiculos (inventario_id, vehiculo_base_id)
SELECT i.id, vb.id
FROM inventario i
CROSS JOIN vehiculos_base vb
WHERE i.codigo IN ('FIL-001', 'FIL-002')
  AND vb.tipo IN ('Sedán', 'SUV')
ON CONFLICT (inventario_id, vehiculo_base_id) DO NOTHING;

-- Pastillas de freno para SUVs y Pickups
INSERT INTO inventario_vehiculos (inventario_id, vehiculo_base_id)
SELECT i.id, vb.id
FROM inventario i
CROSS JOIN vehiculos_base vb
WHERE i.codigo = 'PAS-001'
  AND vb.tipo IN ('SUV', 'Pickup')
ON CONFLICT (inventario_id, vehiculo_base_id) DO NOTHING;

-- Verificación de datos insertados
SELECT 'Clientes insertados:' as descripcion, COUNT(*) as total FROM clientes
UNION ALL
SELECT 'Vehículos base:', COUNT(*) FROM vehiculos_base
UNION ALL
SELECT 'Vehículos clientes:', COUNT(*) FROM vehiculos_clientes
UNION ALL
SELECT 'Productos inventario:', COUNT(*) FROM inventario
UNION ALL
SELECT 'Usuarios:', COUNT(*) FROM usuarios
UNION ALL
SELECT 'Compatibilidad productos-vehículos:', COUNT(*) FROM inventario_vehiculos;
