-- ==========================================
-- 3. INVENTARIO (150 registros)
-- ==========================================
DO $$
DECLARE
    i INTEGER;
    categorias TEXT[] := ARRAY['Lubricantes', 'Filtros', 'Frenos', 'Baterías', 'Sistema Eléctrico', 'Llantas', 'Suspensión', 'Motor'];
    prefijos TEXT[] := ARRAY['ACE', 'FIL', 'FRE', 'BAT', 'ELE', 'LLA', 'SUS', 'MOT'];
    productos TEXT[] := ARRAY['Aceite', 'Filtro', 'Pastilla', 'Batería', 'Bujía', 'Llanta', 'Amortiguador', 'Correa'];
    marcas TEXT[] := ARRAY['Castrol', 'Mobil', 'Shell', 'Total', 'Valvoline', 'Bosch', 'Champion', 'NGK', 'Michelin', 'Goodyear'];
    codigo_gen TEXT;
    nombre_producto TEXT;
    categoria TEXT;
    precio_compra DECIMAL(10,2);
    precio_venta DECIMAL(10,2);
    precio_base DECIMAL(10,2);
BEGIN
    FOR i IN 1..150 LOOP
        categoria := categorias[1 + (i % array_length(categorias, 1))];
        codigo_gen := prefijos[1 + (i % array_length(prefijos, 1))] || '-' || LPAD(i::TEXT, 4, '0');
        nombre_producto := productos[1 + (i % array_length(productos, 1))] || ' ' || 
                          marcas[1 + (i % array_length(marcas, 1))] || ' #' || i;
        
        -- Precios realistas en colones de Costa Rica según categoría
        CASE categoria
            WHEN 'Lubricantes' THEN
                precio_base := 8000 + (RANDOM() * 17000)::INTEGER;  -- ₡8,000 - ₡25,000
            WHEN 'Filtros' THEN
                precio_base := 5000 + (RANDOM() * 10000)::INTEGER;  -- ₡5,000 - ₡15,000
            WHEN 'Frenos' THEN
                precio_base := 15000 + (RANDOM() * 25000)::INTEGER; -- ₡15,000 - ₡40,000
            WHEN 'Baterías' THEN
                precio_base := 50000 + (RANDOM() * 70000)::INTEGER; -- ₡50,000 - ₡120,000
            WHEN 'Sistema Eléctrico' THEN
                precio_base := 3000 + (RANDOM() * 5000)::INTEGER;   -- ₡3,000 - ₡8,000
            WHEN 'Llantas' THEN
                precio_base := 40000 + (RANDOM() * 110000)::INTEGER; -- ₡40,000 - ₡150,000
            WHEN 'Suspensión' THEN
                precio_base := 35000 + (RANDOM() * 45000)::INTEGER; -- ₡35,000 - ₡80,000
            WHEN 'Motor' THEN
                precio_base := 8000 + (RANDOM() * 17000)::INTEGER;  -- ₡8,000 - ₡25,000
        END CASE;
        
        precio_compra := precio_base;
        precio_venta := (precio_base * (1.35 + RANDOM() * 0.35))::DECIMAL(10,2); -- Margen 35%-70%
        
        INSERT INTO inventario (codigo, nombre, descripcion, categoria, cantidad, cantidad_minima, precio_compra, precio_venta, proveedor)
        VALUES (
            codigo_gen,
            nombre_producto,
            'Repuesto de calidad ' || categoria || ' - ' || nombre_producto,
            categoria,
            15 + (RANDOM() * 85)::INTEGER,  -- 15-100 unidades
            5 + (RANDOM() * 10)::INTEGER,   -- 5-15 unidades mínimas
            precio_compra,
            precio_venta,
            'Proveedor ' || marcas[1 + (i % array_length(marcas, 1))]
        )
        ON CONFLICT (codigo) DO NOTHING;
    END LOOP;
END $$;

SELECT 'Inventario insertado: ' || COUNT(*)::TEXT FROM inventario;
