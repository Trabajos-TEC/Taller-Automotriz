-- ==========================================
-- 2. VEHÍCULOS BASE (150 registros)
-- ==========================================
DO $$
DECLARE
    marcas TEXT[] := ARRAY['Toyota', 'Honda', 'Nissan', 'Ford', 'Chevrolet', 'Mazda', 'Hyundai', 'Kia', 'Volkswagen', 'BMW', 'Mercedes-Benz', 'Audi', 'Mitsubishi', 'Suzuki', 'Jeep'];
    modelos_toyota TEXT[] := ARRAY['Corolla', 'Hilux', 'RAV4', 'Yaris', 'Prado', 'Fortuner', 'Camry', 'Tacoma', '4Runner', 'Highlander'];
    modelos_honda TEXT[] := ARRAY['Civic', 'CR-V', 'Accord', 'HR-V', 'Pilot', 'Fit', 'City', 'Odyssey'];
    modelos_nissan TEXT[] := ARRAY['Sentra', 'Frontier', 'X-Trail', 'Versa', 'Pathfinder', 'Kicks', 'Qashqai', 'Navara'];
    modelos_ford TEXT[] := ARRAY['F-150', 'Escape', 'Explorer', 'Ranger', 'Mustang', 'Fiesta', 'Fusion', 'Expedition'];
    modelos_chevrolet TEXT[] := ARRAY['Spark', 'Silverado', 'Tahoe', 'Equinox', 'Cruze', 'Tracker', 'Blazer', 'Malibu'];
    modelos_mazda TEXT[] := ARRAY['3', 'CX-5', 'CX-30', '6', 'CX-9', '2', 'BT-50'];
    modelos_hyundai TEXT[] := ARRAY['Accent', 'Elantra', 'Tucson', 'Santa Fe', 'Creta', 'Kona', 'i10'];
    modelos_kia TEXT[] := ARRAY['Sportage', 'Rio', 'Sorento', 'Seltos', 'Soul', 'Forte', 'Carnival'];
    modelos_volkswagen TEXT[] := ARRAY['Jetta', 'Tiguan', 'Passat', 'Polo', 'Golf', 'Amarok', 'T-Cross'];
    modelos_genericos TEXT[] := ARRAY['Serie 1', 'Serie 2', 'Serie 3', 'Clase A', 'Clase C', 'A3', 'A4', 'Lancer', 'Outlander', 'Swift', 'Vitara', 'Wrangler', 'Cherokee', 'Grand Cherokee'];
    tipos TEXT[] := ARRAY['Sedán', 'SUV', 'Pickup', 'Hatchback', 'Coupé', 'Camioneta'];
    i INTEGER;
    v_marca TEXT;
    v_modelo TEXT;
    v_anio INTEGER;
    v_tipo TEXT;
BEGIN
    FOR i IN 1..150 LOOP
        v_marca := marcas[1 + (i % array_length(marcas, 1))];
        v_anio := 2010 + (i % 15);  -- Años 2010-2024
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
        ELSIF v_marca = 'Mazda' THEN
            v_modelo := modelos_mazda[1 + (i % array_length(modelos_mazda, 1))];
        ELSIF v_marca = 'Hyundai' THEN
            v_modelo := modelos_hyundai[1 + (i % array_length(modelos_hyundai, 1))];
        ELSIF v_marca = 'Kia' THEN
            v_modelo := modelos_kia[1 + (i % array_length(modelos_kia, 1))];
        ELSIF v_marca = 'Volkswagen' THEN
            v_modelo := modelos_volkswagen[1 + (i % array_length(modelos_volkswagen, 1))];
        ELSE
            v_modelo := modelos_genericos[1 + (i % array_length(modelos_genericos, 1))];
        END IF;
        
        INSERT INTO vehiculos_base (marca, modelo, anio, tipo)
        VALUES (v_marca, v_modelo, v_anio, v_tipo)
        ON CONFLICT (marca, modelo, anio, tipo) DO NOTHING;
    END LOOP;
END $$;

SELECT 'Vehículos Base insertados: ' || COUNT(*)::TEXT FROM vehiculos_base;
