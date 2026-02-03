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
    FOR orden_rec IN (SELECT id FROM ordenes_trabajo) LOOP
        num_repuestos := 1 + (RANDOM() * 2)::INTEGER;
        num_servicios := (RANDOM() * 2)::INTEGER;
        
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

SELECT 'Repuestos de Órdenes: ' || COUNT(*)::TEXT FROM orden_repuestos
UNION ALL
SELECT 'Servicios de Órdenes: ' || COUNT(*)::TEXT FROM orden_servicios;
