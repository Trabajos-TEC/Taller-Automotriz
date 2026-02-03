-- ==========================================
-- 5. VEHÍCULOS DE CLIENTES (150 registros)
-- ==========================================
DO $$
DECLARE
    cliente_rec RECORD;
    vehiculo_base_rec RECORD;
    v_placa TEXT;
    contador INTEGER := 0;
    letras TEXT[] := ARRAY['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W'];
BEGIN
    FOR cliente_rec IN (SELECT id FROM clientes ORDER BY id LIMIT 150) LOOP
        SELECT * INTO vehiculo_base_rec FROM vehiculos_base ORDER BY RANDOM() LIMIT 1;
        
        v_placa := letras[1 + (contador % array_length(letras, 1))] || 
                   letras[1 + ((contador / 20) % array_length(letras, 1))] || 
                   letras[1 + ((contador / 400) % array_length(letras, 1))] || '-' ||
                   LPAD((100 + contador)::TEXT, 3, '0');
        
        INSERT INTO vehiculos_clientes (cliente_id, vehiculo_base_id, placa, color, kilometraje)
        VALUES (
            cliente_rec.id,
            vehiculo_base_rec.id,
            v_placa,
            (ARRAY['Blanco', 'Negro', 'Gris', 'Rojo', 'Azul', 'Plateado'])[1 + (contador % 6)],
            10000 + (contador * 1000)
        )
        ON CONFLICT (placa) DO NOTHING;
        
        contador := contador + 1;
    END LOOP;
END $$;

SELECT 'Vehículos de Clientes insertados: ' || COUNT(*)::TEXT FROM vehiculos_clientes;
