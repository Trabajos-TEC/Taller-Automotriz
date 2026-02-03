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
        
        INSERT INTO clientes (nombre, cedula, correo, numero, taller_id)
        VALUES (nombre_completo, cedula_gen, correo, telefono, 1)
        ON CONFLICT (cedula) DO NOTHING;
    END LOOP;
END $$;

SELECT 'Clientes insertados: ' || COUNT(*)::TEXT FROM clientes;
