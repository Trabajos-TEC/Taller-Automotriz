-- ==========================================
-- 8. ÓRDENES DE TRABAJO (150 registros)
-- ==========================================
DO $$
DECLARE
    i INTEGER;
    vehiculo_cliente_rec RECORD;
    servicio_rec RECORD;
    mecanico_rec RECORD;
    fecha_entrada TIMESTAMP;
    estados TEXT[] := ARRAY['pendiente', 'en_proceso', 'completado', 'cancelado'];
    costo_adicional DECIMAL(10,2);
BEGIN
    FOR i IN 1..150 LOOP
        SELECT * INTO vehiculo_cliente_rec FROM vehiculos_clientes ORDER BY RANDOM() LIMIT 1;
        SELECT * INTO servicio_rec FROM servicios ORDER BY RANDOM() LIMIT 1;
        SELECT * INTO mecanico_rec FROM usuarios WHERE roles = 'mecanico' ORDER BY RANDOM() LIMIT 1;
        
        fecha_entrada := CURRENT_TIMESTAMP - INTERVAL '45 days' + (i || ' days')::INTERVAL;
        
        -- Costo base del servicio + variación aleatoria realista
        costo_adicional := (RANDOM() * 20000)::DECIMAL(10,2); -- Variación de ₡0-₡20,000
        
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
            'Orden de trabajo #' || LPAD(i::TEXT, 4, '0') || ': ' || servicio_rec.descripcion,
            fecha_entrada,
            servicio_rec.precio + costo_adicional,
            estados[1 + (i % array_length(estados, 1))],
            mecanico_rec.id
        );
    END LOOP;
END $$;

SELECT 'Órdenes de Trabajo insertadas: ' || COUNT(*)::TEXT FROM ordenes_trabajo;
