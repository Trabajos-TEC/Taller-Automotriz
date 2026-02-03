-- ==========================================
-- 6. SERVICIOS (10 registros) - Precios en Colones CR
-- ==========================================
INSERT INTO servicios (codigo, nombre, precio, descripcion) VALUES
    ('S001', 'Cambio de Aceite', 22000.00, 'Cambio completo de aceite y filtro de motor'),
    ('S002', 'Revisión de Frenos', 28000.00, 'Revisión completa del sistema de frenos'),
    ('S003', 'Cambio de Pastillas', 38000.00, 'Cambio de pastillas delanteras y traseras'),
    ('S004', 'Alineación', 15000.00, 'Alineación computarizada de las 4 ruedas'),
    ('S005', 'Balanceo', 12000.00, 'Balanceo de ruedas con pesas'),
    ('S006', 'Cambio de Batería', 15000.00, 'Cambio e instalación de batería nueva'),
    ('S007', 'Revisión Eléctrica', 35000.00, 'Diagnóstico completo del sistema eléctrico'),
    ('S008', 'Cambio de Amortiguadores', 65000.00, 'Cambio de amortiguadores delanteros (mano de obra)'),
    ('S009', 'Revisión de Motor', 55000.00, 'Diagnóstico completo del motor con scanner'),
    ('S010', 'Cambio de Correa', 42000.00, 'Cambio de correa de distribución y tensores')
ON CONFLICT (codigo) DO NOTHING;

SELECT 'Servicios insertados: ' || COUNT(*)::TEXT FROM servicios;
