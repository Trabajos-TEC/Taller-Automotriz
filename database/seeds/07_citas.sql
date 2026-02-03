-- ==========================================
-- 7. CITAS (150 registros)
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
    FOR i IN 1..150 LOOP
        SELECT * INTO vehiculo_cliente_rec FROM vehiculos_clientes ORDER BY RANDOM() LIMIT 1;
        SELECT * INTO usuario_rec FROM usuarios WHERE roles = 'admin' OR roles = 'mecanico' ORDER BY RANDOM() LIMIT 1;
        
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

SELECT 'Citas insertadas: ' || COUNT(*)::TEXT FROM citas;
