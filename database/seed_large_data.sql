-- Script para poblar la base de datos con datos de prueba (100+ registros)
-- Ejecutar: psql -h <host> -U <user> -d <database> -f seed_large_data.sql

-- ==========================================
-- 1. CLIENTES (150 registros)
-- ==========================================
DO $$
DECLARE
    i INTEGER;
    nombres TEXT[] := ARRAY['Juan', 'María', 'Carlos', 'Ana', 'Pedro', 'Laura', 'José', 'Carmen', 'Luis', 'Rosa', 
                           'Miguel', 'Elena', 'Francisco', 'Isabel', 'Antonio', 'Patricia', 'Manuel', 'Lucía', 'David', 'Marta',
                           'Javier', 'Sofía', 'Andrés', 'Paula', 'Diego', 'Cristina', 'Pablo', 'Beatriz', 'Sergio', 'Raquel'];
    apellidos TEXT[] := ARRAY['Pérez', 'González', 'Rodríguez', 'Martínez', 'Sánchez', 'López', 'Fernández', 'García', 'Ramírez', 'Torres',
                             'Flores', 'Rivera', 'Gómez', 'Díaz', 'Vargas', 'Castro', 'Rojas', 'Morales', 'Jiménez', 'Hernández'];
    nombre_completo TEXT;
    cedula_gen TEXT;
    correo TEXT;
    telefono TEXT;
BEGIN
    FOR i IN 1..150 LOOP
        nombre_completo := nombres[1 + (i % array_length(nombres, 1))] || ' ' || apellidos[1 + ((i * 3) % array_length(apellidos, 1))];
        cedula_gen := LPAD((100000000 + i)::TEXT, 10, '0');
        correo := LOWER(REPLACE(nombre_completo, ' ', '.')) || i || '@email.com';
        telefono := '8' || LPAD((8000000 + i)::TEXT, 7, '0');
        
        INSERT INTO clientes (nombre, cedula, correo, numero)
        VALUES (nombre_completo, cedula_gen, correo, telefono)
        ON CONFLICT (cedula) DO NOTHING;
    END LOOP;
END $$;

-- ==========================================
-- 2. VEHÍCULOS BASE (100 registros)
-- ==========================================
DO $$
DECLARE
    marcas TEXT[] := ARRAY['Toyota', 'Honda', 'Nissan', 'Ford', 'Chevrolet', 'Mazda', 'Hyundai', 'Kia', 'Volkswagen', 'BMW'];
    modelos_toyota TEXT[] := ARRAY['Corolla', 'Hilux', 'RAV4', 'Yaris', 'Prado', 'Fortuner'];
    modelos_honda TEXT[] := ARRAY['Civic', 'CR-V', 'Accord', 'HR-V', 'Pilot'];
    modelos_nissan TEXT[] := ARRAY['Sentra', 'Frontier', 'X-Trail', 'Versa', 'Pathfinder'];
    modelos_ford TEXT[] := ARRAY['F-150', 'Escape', 'Explorer', 'Ranger', 'Mustang'];
    modelos_chevrolet TEXT[] := ARRAY['Spark', 'Silverado', 'Tahoe', 'Equinox', 'Cruze'];
    tipos TEXT[] := ARRAY['Sedán', 'SUV', 'Pickup', 'Hatchback', 'Coupé'];
    i INTEGER;
    v_marca TEXT;
    v_modelo TEXT;
    v_anio INTEGER;
    v_tipo TEXT;
BEGIN
    FOR i IN 1..100 LOOP
        v_marca := marcas[1 + (i % array_length(marcas, 1))];
        v_anio := 2015 + (i % 10);
        v_tipo := tipos[1 + (i % array_length(tipos, 1))];
        
        IF v_marca = 'Toyota' THEN
            v_modelo := modelos_toyota[1 + (i % array_length(modelos_toyota, 1))];
        ELSIF v_marca = 'Honda' THEN
            v_modelo := modelos_honda[1 + (i % array_length(modelos_honda, 1))];
        ELSIF v_marca = 'Nissan' THEN
            v_modelo := modelos_nissan[1 + (i % array_length(modelos_nissan, 1))];
        ELSIF v_marca = 'Ford' THEN
            v_modelo := modelos_ford[1 + (i % array_length(modelos_ford, 1))];
        ELSIF v_marca = 'Chevrolet' THEN
            v_modelo := modelos_chevrolet[1 + (i % array_length(modelos_chevrolet, 1))];
        ELSE
            v_modelo := 'Modelo ' || i;
        END IF;
        
        INSERT INTO vehiculos_base (marca, modelo, anio, tipo)
        VALUES (v_marca, v_modelo, v_anio, v_tipo)
        ON CONFLICT (marca, modelo, anio, tipo) DO NOTHING;
    END LOOP;
END $$;

-- ==========================================
-- 3. INVENTARIO (120 registros)
-- ==========================================
DO $$
DECLARE
    i INTEGER;
    categorias TEXT[] := ARRAY['Lubricantes', 'Filtros', 'Frenos', 'Baterías', 'Sistema Eléctrico', 'Llantas', 'Suspensión', 'Motor'];
    prefijos TEXT[] := ARRAY['ACE', 'FIL', 'FRE', 'BAT', 'ELE', 'LLA', 'SUS', 'MOT'];
    productos TEXT[] := ARRAY['Aceite', 'Filtro', 'Pastilla', 'Batería', 'Bujía', 'Llanta', 'Amortiguador', 'Correa'];
    codigo_gen TEXT;
    nombre_producto TEXT;
    categoria TEXT;
    precio_compra DECIMAL(10,2);
    precio_venta DECIMAL(10,2);
BEGIN
    FOR i IN 1..120 LOOP
        categoria := categorias[1 + (i % array_length(categorias, 1))];
        codigo_gen := prefijos[1 + (i % array_length(prefijos, 1))] || '-' || LPAD(i::TEXT, 3, '0');
        nombre_producto := productos[1 + (i % array_length(productos, 1))] || ' Modelo ' || i;
        precio_compra := (10 + (i % 90))::DECIMAL(10,2);
        precio_venta := precio_compra * 2;
        
        INSERT INTO inventario (codigo, nombre, descripcion, categoria, cantidad, cantidad_minima, precio_compra, precio_venta, proveedor)
        VALUES (
            codigo_gen,
            nombre_producto,
            'Descripción del ' || nombre_producto,
            categoria,
            20 + (i % 80),
            5 + (i % 10),
            precio_compra,
            precio_venta,
            'Proveedor ' || ((i % 5) + 1)
        )
        ON CONFLICT (codigo) DO NOTHING;
    END LOOP;
END $$;

-- ==========================================
-- 4. VINCULAR CLIENTES CON TALLER
-- ==========================================
INSERT INTO clientes_talleres (cliente_id, taller_id)
SELECT c.id, 1
FROM clientes c
WHERE NOT EXISTS (
    SELECT 1 FROM clientes_talleres ct 
    WHERE ct.cliente_id = c.id AND ct.taller_id = 1
)
LIMIT 150;

-- ==========================================
-- 5. VEHÍCULOS DE CLIENTES (150 registros)
-- ==========================================
DO $$
DECLARE
    cliente_rec RECORD;
    vehiculo_base_rec RECORD;
    placa TEXT;
    contador INTEGER := 0;
    letras TEXT[] := ARRAY['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W'];
BEGIN
    FOR cliente_rec IN (SELECT id FROM clientes ORDER BY id LIMIT 150) LOOP
        -- Seleccionar un vehículo base aleatorio
        SELECT * INTO vehiculo_base_rec FROM vehiculos_base ORDER BY RANDOM() LIMIT 1;
        
        -- Generar placa única
        placa := letras[1 + (contador % array_length(letras, 1))] || 
                 letras[1 + ((contador / 20) % array_length(letras, 1))] || 
                 letras[1 + ((contador / 400) % array_length(letras, 1))] || '-' ||
                 LPAD((100 + contador)::TEXT, 3, '0');
        
        INSERT INTO vehiculos_clientes (cliente_id, vehiculo_base_id, placa, color, kilometraje)
        VALUES (
            cliente_rec.id,
            vehiculo_base_rec.id,
            placa,
            (ARRAY['Blanco', 'Negro', 'Gris', 'Rojo', 'Azul', 'Plateado'])[1 + (contador % 6)],
            10000 + (contador * 1000)
        )
        ON CONFLICT (placa) DO NOTHING;
        
        contador := contador + 1;
    END LOOP;
END $$;

-- ==========================================
-- 6. CITAS (120 registros)
-- ==========================================
DO $$
DECLARE
    i INTEGER;
    vehiculo_cliente_rec RECORD;
    usuario_rec RECORD;
    fecha_cita DATE;
    hora_cita TIME;
    estados TEXT[] := ARRAY['pendiente', 'aceptada', 'rechazada', 'completada'];
BEGIN
    FOR i IN 1..120 LOOP
        SELECT * INTO vehiculo_cliente_rec FROM vehiculos_clientes ORDER BY RANDOM() LIMIT 1;
        SELECT * INTO usuario_rec FROM usuarios WHERE roles = 'admin' OR roles = 'mecanico' ORDER BY RANDOM() LIMIT 1;
        
        -- Generar fechas desde hace 60 días hasta dentro de 30 días
        fecha_cita := (CURRENT_DATE - INTERVAL '60 days' + (i || ' days')::INTERVAL)::DATE;
        hora_cita := ('08:00:00'::TIME + ((i % 10) || ' hours')::INTERVAL)::TIME;
        
        INSERT INTO citas (
            vehiculo_cliente_id,
            fecha,
            hora,
            descripcion,
            usuario_id,
            estado,
            created_at
        )
        VALUES (
            vehiculo_cliente_rec.id,
            fecha_cita,
            hora_cita,
            (ARRAY['Mantenimiento preventivo', 'Revisión general', 'Reparación de frenos', 
                   'Cambio de aceite', 'Alineación y balanceo', 'Revisión eléctrica'])[1 + (i % 6)],
            usuario_rec.id,
            estados[1 + (i % array_length(estados, 1))],
            CURRENT_TIMESTAMP - INTERVAL '2 days'
        );
    END LOOP;
END $$;

-- ==========================================
-- 7. SERVICIOS
-- ==========================================
INSERT INTO servicios (codigo, nombre, precio, descripcion) VALUES
    ('S001', 'Cambio de Aceite', 15000.00, 'Cambio completo de aceite y filtro'),
    ('S002', 'Revisión de Frenos', 20000.00, 'Revisión completa del sistema de frenos'),
    ('S003', 'Cambio de Pastillas', 25000.00, 'Cambio de pastillas delanteras y traseras'),
    ('S004', 'Alineación', 12000.00, 'Alineación de las 4 ruedas'),
    ('S005', 'Balanceo', 10000.00, 'Balanceo de ruedas'),
    ('S006', 'Cambio de Batería', 10000.00, 'Cambio e instalación de batería'),
    ('S007', 'Revisión Eléctrica', 30000.00, 'Diagnóstico del sistema eléctrico'),
    ('S008', 'Cambio de Amortiguadores', 50000.00, 'Cambio de amortiguadores delanteros'),
    ('S009', 'Revisión de Motor', 45000.00, 'Diagnóstico completo del motor'),
    ('S010', 'Cambio de Correa', 35000.00, 'Cambio de correa de distribución')
ON CONFLICT (codigo) DO NOTHING;

-- ==========================================
-- 8. ÓRDENES DE TRABAJO (100 registros)
-- ==========================================
DO $$
DECLARE
    i INTEGER;
    vehiculo_cliente_rec RECORD;
    servicio_rec RECORD;
    mecanico_rec RECORD;
    fecha_entrada TIMESTAMP;
    estados TEXT[] := ARRAY['pendiente', 'en_proceso', 'completado', 'cancelado'];
BEGIN
    FOR i IN 1..100 LOOP
        -- Seleccionar vehículo aleatorio
        SELECT * INTO vehiculo_cliente_rec FROM vehiculos_clientes ORDER BY RANDOM() LIMIT 1;
        
        -- Seleccionar servicio aleatorio
        SELECT * INTO servicio_rec FROM servicios ORDER BY RANDOM() LIMIT 1;
        
        -- Seleccionar mecánico aleatorio
        SELECT * INTO mecanico_rec FROM usuarios WHERE roles = 'mecanico' ORDER BY RANDOM() LIMIT 1;
        
        -- Generar fecha desde hace 30 días hasta hoy
        fecha_entrada := CURRENT_TIMESTAMP - INTERVAL '30 days' + (i || ' days')::INTERVAL;
        
        INSERT INTO ordenes_trabajo (
            vehiculo_cliente_id,
            servicio_id,
            tipo_servicio,
            descripcion,
            fecha_entrada,
            costo,
            estado,
            mecanico_id
        )
        VALUES (
            vehiculo_cliente_rec.id,
            servicio_rec.id,
            servicio_rec.nombre,
            'Orden de trabajo ' || i || ': ' || servicio_rec.descripcion,
            fecha_entrada,
            servicio_rec.precio + ((i % 10) * 1000),
            estados[1 + (i % array_length(estados, 1))],
            mecanico_rec.id
        );
    END LOOP;
END $$;

-- ==========================================
-- 9. REPUESTOS Y SERVICIOS DE ÓRDENES (200+ registros)
-- ==========================================
DO $$
DECLARE
    orden_rec RECORD;
    producto_rec RECORD;
    servicio_rec RECORD;
    num_repuestos INTEGER;
    num_servicios INTEGER;
    i INTEGER;
BEGIN
    -- Para cada orden de trabajo, agregar entre 1-3 repuestos y 0-2 servicios adicionales
    FOR orden_rec IN (SELECT id FROM ordenes_trabajo) LOOP
        num_repuestos := 1 + (RANDOM() * 2)::INTEGER;
        num_servicios := (RANDOM() * 2)::INTEGER;
        
        -- Agregar repuestos
        FOR i IN 1..num_repuestos LOOP
            SELECT * INTO producto_rec FROM inventario ORDER BY RANDOM() LIMIT 1;
            
            INSERT INTO orden_repuestos (
                orden_trabajo_id,
                producto_codigo,
                producto_nombre,
                cantidad,
                precio_unitario,
                subtotal
            )
            VALUES (
                orden_rec.id,
                producto_rec.codigo,
                producto_rec.nombre,
                1 + (RANDOM() * 3)::INTEGER,
                producto_rec.precio_venta,
                producto_rec.precio_venta * (1 + (RANDOM() * 3)::INTEGER)
            );
        END LOOP;
        
        -- Agregar servicios adicionales
        FOR i IN 1..num_servicios LOOP
            SELECT * INTO servicio_rec FROM servicios ORDER BY RANDOM() LIMIT 1;
            
            INSERT INTO orden_servicios (
                orden_trabajo_id,
                servicio_codigo,
                servicio_nombre,
                descripcion,
                precio
            )
            VALUES (
                orden_rec.id,
                servicio_rec.codigo,
                servicio_rec.nombre,
                servicio_rec.descripcion,
                servicio_rec.precio
            );
        END LOOP;
    END LOOP;
END $$;

-- ==========================================
-- RESUMEN DE DATOS INSERTADOS
-- ==========================================
SELECT 
    'Clientes' as tabla, COUNT(*) as total FROM clientes
UNION ALL
SELECT 'Vehículos Base', COUNT(*) FROM vehiculos_base
UNION ALL
SELECT 'Inventario', COUNT(*) FROM inventario
UNION ALL
SELECT 'Vehículos de Clientes', COUNT(*) FROM vehiculos_clientes
UNION ALL
SELECT 'Citas', COUNT(*) FROM citas
UNION ALL
SELECT 'Servicios', COUNT(*) FROM servicios
UNION ALL
SELECT 'Órdenes de Trabajo', COUNT(*) FROM ordenes_trabajo
UNION ALL
SELECT 'Repuestos de Órdenes', COUNT(*) FROM orden_repuestos
UNION ALL
SELECT 'Servicios de Órdenes', COUNT(*) FROM orden_servicios;
